import { CustomFont } from '../types';

const DB_NAME = 'HorusFontDB';
const DB_VERSION = 1;
const STORE_NAME = 'fonts';

let db: IDBDatabase;

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    // Check if db is already initialized
    if (db) {
        return resolve(true);
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(false);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(true);
    };

    request.onupgradeneeded = () => {
      const dbInstance = request.result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        dbInstance.createObjectStore(STORE_NAME, { keyPath: 'name' });
      }
    };
  });
};

export const addFont = (font: CustomFont): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject('DB is not initialized.');
      return;
    }
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(font);

    request.onsuccess = () => resolve();
    request.onerror = () => {
      console.error('Error adding font:', request.error);
      reject(request.error);
    };
  });
};

export const getFonts = (): Promise<CustomFont[]> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject('DB is not initialized.');
      return;
    }
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.error('Error getting fonts:', request.error);
      reject(request.error);
    };
  });
};

export const deleteFont = (fontName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject('DB is not initialized.');
      return;
    }
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(fontName);

    request.onsuccess = () => resolve();
    request.onerror = () => {
      console.error('Error deleting font:', request.error);
      reject(request.error);
    };
  });
};
