// src/utils/indexedDBService.js
const DB_NAME = 'photoMapDB';
const DB_VERSION = 1;
const PHOTO_STORE = 'photos';

class IndexedDBService {
  constructor() {
    this.db = null;
    this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object store for photos if it doesn't exist
        if (!db.objectStoreNames.contains(PHOTO_STORE)) {
          const photoStore = db.createObjectStore(PHOTO_STORE, { keyPath: 'id', autoIncrement: true });
          photoStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async getDB() {
    if (this.db) return this.db;
    return this.initDB();
  }

  async savePhoto(photoData) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PHOTO_STORE], 'readwrite');
      const store = transaction.objectStore(PHOTO_STORE);
      const request = store.add(photoData);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async savePhotos(photosData) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PHOTO_STORE], 'readwrite');
      const store = transaction.objectStore(PHOTO_STORE);
      
      let count = 0;
      
      photosData.forEach(photo => {
        const request = store.add(photo);
        request.onsuccess = () => {
          count++;
          if (count === photosData.length) {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getAllPhotos() {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PHOTO_STORE], 'readonly');
      const store = transaction.objectStore(PHOTO_STORE);
      const index = store.index('timestamp');
      const request = index.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deletePhoto(id) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PHOTO_STORE], 'readwrite');
      const store = transaction.objectStore(PHOTO_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllPhotos() {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PHOTO_STORE], 'readwrite');
      const store = transaction.objectStore(PHOTO_STORE);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Initialize and export as singleton
const indexedDBService = new IndexedDBService();
export default indexedDBService;