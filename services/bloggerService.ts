import { BloggerUser, BloggerBlog, GeneratedArticle } from '../types';

declare const gapi: any;
declare const google: any;

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/blogger/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/blogger https://www.googleapis.com/auth/userinfo.profile";

export interface BloggerConfig {
    apiKey: string;
    clientId: string;
}

let tokenClient: any = null;

/**
 * Initiates the Google Sign-In flow using the modern Google Identity Services (GIS) library.
 * This is the correct and recommended approach to avoid issues like 'Invalid cookiePolicy'.
 * @param config The Blogger API and Client ID configuration.
 * @param onAuthUpdate A callback function to update the authentication state in the UI.
 * @returns A promise that resolves on successful sign-in or rejects on failure.
 */
const signIn = (config: BloggerConfig, onAuthUpdate: (isSignedIn: boolean) => void): Promise<void> => {
    return new Promise((resolve, reject) => {
        gapi.load('client', async () => {
            try {
                // Step 1: Initialize the GAPI client for making API calls.
                // This does NOT perform authentication and thus avoids cookie policy errors.
                await gapi.client.init({
                    apiKey: config.apiKey,
                    discoveryDocs: DISCOVERY_DOCS,
                });

                // Step 2: Initialize the GIS token client for handling the OAuth2 flow.
                tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: config.clientId,
                    scope: SCOPES,
                    callback: (tokenResponse: any) => {
                        if (tokenResponse && tokenResponse.access_token) {
                            // On success, the token is received.
                            // Set it for the gapi client to use in subsequent API calls.
                            gapi.client.setToken(tokenResponse);
                            onAuthUpdate(true);
                            resolve();
                        } else {
                            reject(new Error("Authentication failed: No access token was received from Google."));
                        }
                    },
                    error_callback: (error: any) => {
                        // This callback handles errors from the GIS flow, like the user closing the popup.
                        console.error('GIS Authentication Error:', error);
                        if (error && error.type === 'popup_closed') {
                            reject(new Error("popup_closed_by_user: Sign-in window was closed by the user."));
                        } else if (error && error.type === 'popup_failed_to_open') {
                             reject(new Error("popup_failed_to_open: The browser blocked the sign-in popup. Please allow popups for this site."));
                        }
                        else {
                            reject(new Error(error.message || "An unknown authentication error occurred."));
                        }
                    }
                });

                // Step 3: Request the access token. By removing 'prompt: consent', we allow
                // the library to get a token silently if the user is already signed in
                // and has granted consent, avoiding the problematic popup.
                tokenClient.requestAccessToken();

            } catch (err: any) {
                reject(new Error(`Blogger API client initialization failed: ${err.details || err.message || JSON.stringify(err)}`));
            }
        });
    });
};

/**
 * Signs the user out by revoking the token and clearing it from the gapi client.
 * @param onAuthUpdate A callback function to update the authentication state.
 */
const signOut = (onAuthUpdate: (isSignedIn: boolean) => void) => {
    const token = gapi.client.getToken();
    if (token && token.access_token) {
        // Revoke the token to invalidate it on Google's side.
        google.accounts.oauth2.revoke(token.access_token, () => {
            console.log('User token revoked.');
        });
        // Clear the token from the gapi client.
        gapi.client.setToken(null);
    }
    onAuthUpdate(false);
};


const listBlogs = async (): Promise<{id: string, name: string}[]> => {
    const response = await gapi.client.blogger.blogs.listByUser({ userId: 'self' });
    return response.result.items?.map((blog: any) => ({ id: blog.id, name: blog.name })) || [];
};

const publishPost = async (blogId: string, article: GeneratedArticle): Promise<any> => {
    const keywords = article.metaKeywords.split(',').map(k => k.trim()).filter(Boolean);

    const postResource = {
        title: article.title,
        content: article.html,
        labels: keywords,
    };

    const response = await gapi.client.blogger.posts.insert({
        blogId: blogId,
        isDraft: true, // Always publish as draft for user safety
        resource: postResource,
    });
    
    return response.result;
};

const getCurrentUser = async (): Promise<BloggerUser | null> => {
    try {
        const response = await gapi.client.request({
            'path': 'https://www.googleapis.com/oauth2/v2/userinfo'
        });
        if (response && response.result) {
            return {
                name: response.result.name,
                imageUrl: response.result.picture,
            };
        }
        return { name: "Connected User" }; // Fallback
    } catch(error) {
        console.error("Error fetching user info:", error);
        throw new Error("Could not fetch user information after authentication.");
    }
};

export const bloggerService = {
    signIn,
    signOut,
    listBlogs,
    publishPost,
    getCurrentUser,
};