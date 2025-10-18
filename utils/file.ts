/**
 * Reads a File object and converts it into a base64 data object.
 * @param file The File object from an input element.
 * @returns A promise that resolves with an object containing the base64 data, mime type, and original file name.
 */
export function fileToImageObject(file: File): Promise<{ data: string; mimeType: string; name: string; }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve({ data: base64Data, mimeType: file.type, name: file.name });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Reads a text file and returns its content as a string.
 * @param file The File object from an input element (should be a .txt file).
 * @returns A promise that resolves with the string content of the file.
 */
export function fileToText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result as string);
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsText(file);
    });
}


/**
 * Fetches an image from a URL and converts it to a base64 data object.
 * @param url The URL of the image to fetch.
 * @returns A promise that resolves with an object containing the base64 data and mime type.
 */
export function imageUrlToImageObject(url: string): Promise<{ data: string; mimeType: string; name: string; }> {
  return new Promise(async (resolve, reject) => {
    try {
      // Note: This may fail for URLs that don't have CORS enabled.
      // Using a proxy is a common workaround for CORS issues in production.
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        resolve({ data: base64Data, mimeType: blob.type, name: 'hosted-image.png' });
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Error converting image URL to base64:", error);
      reject(new Error("لا يمكن جلب الصورة المستضافة. قد تكون محمية بسياسة CORS. يرجى تنزيلها ورفعها يدويًا للتعديل."));
    }
  });
}