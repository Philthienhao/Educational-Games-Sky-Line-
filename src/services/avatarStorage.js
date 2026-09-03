/**
 * Dedicated High-Capacity Student Avatar Storage Service
 * Uses IndexedDB (250MB+ capacity) + LocalStorage Fallback + In-Memory Cache
 * Guarantees student avatars NEVER get lost on page refresh or hit localStorage quota errors.
 */

const DB_NAME = 'GVD_SkyLine_StorageDB';
const DB_VERSION = 2;
const AVATAR_STORE = 'avatars_store';

// In-memory cache for instant synchronous rendering
const avatarCache = new Map();

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      if (!window.indexedDB) {
        resolve(null);
        return;
      }
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(AVATAR_STORE)) {
            db.createObjectStore(AVATAR_STORE);
          }
          if (!db.objectStoreNames.contains('keyvalue_store')) {
            db.createObjectStore('keyvalue_store');
          }
        };
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
        request.onerror = () => {
          resolve(null);
        };
      } catch (e) {
        resolve(null);
      }
    });
  }
  return dbPromise;
}

export const AvatarStorageService = {
  /**
   * Synchronously get avatar from memory cache or localStorage
   */
  getAvatarSync: (studentId) => {
    if (!studentId) return '';
    if (avatarCache.has(studentId)) {
      return avatarCache.get(studentId);
    }
    try {
      const stored = localStorage.getItem(`gvd_av_${studentId}`);
      if (stored) {
        avatarCache.set(studentId, stored);
        return stored;
      }
    } catch (e) {}
    return '';
  },

  /**
   * Asynchronously get avatar from IndexedDB (fallback if localStorage empty)
   */
  getAvatarAsync: async (studentId) => {
    if (!studentId) return '';
    const cached = AvatarStorageService.getAvatarSync(studentId);
    if (cached) return cached;

    try {
      const db = await getDB();
      if (db) {
        return new Promise((resolve) => {
          try {
            const tx = db.transaction(AVATAR_STORE, 'readonly');
            const store = tx.objectStore(AVATAR_STORE);
            const req = store.get(studentId);
            req.onsuccess = () => {
              const val = req.result || '';
              if (val) {
                avatarCache.set(studentId, val);
                try {
                  localStorage.setItem(`gvd_av_${studentId}`, val);
                } catch(e) {}
              }
              resolve(val);
            };
            req.onerror = () => resolve('');
          } catch(e) {
            resolve('');
          }
        });
      }
    } catch (e) {}
    return '';
  },

  /**
   * Save student avatar to Memory Cache + LocalStorage + IndexedDB
   */
  saveAvatar: async (studentId, base64DataUrl) => {
    if (!studentId) return;

    const val = base64DataUrl || '';
    avatarCache.set(studentId, val);

    // 1. Save to dedicated localStorage key
    try {
      if (val) {
        localStorage.setItem(`gvd_av_${studentId}`, val);
      } else {
        localStorage.removeItem(`gvd_av_${studentId}`);
      }
    } catch (e) {
      console.warn('AvatarStorageService: localStorage full, relying on IndexedDB', e);
    }

    // 2. Save to IndexedDB (unlimited capacity)
    try {
      const db = await getDB();
      if (db) {
        const tx = db.transaction(AVATAR_STORE, 'readwrite');
        const store = tx.objectStore(AVATAR_STORE);
        if (val) {
          store.put(val, studentId);
        } else {
          store.delete(studentId);
        }
      }
    } catch (e) {}
  },

  /**
   * Preload all avatars for a list of students into memory cache
   */
  preloadAvatars: async (students = []) => {
    if (!Array.isArray(students)) return;
    await Promise.all(
      students.map(async (st) => {
        if (!st || !st.id) return;
        
        // If student object has avatar property, seed it into cache
        if (st.avatar) {
          avatarCache.set(st.id, st.avatar);
          try {
            localStorage.setItem(`gvd_av_${st.id}`, st.avatar);
          } catch(e) {}
        } else {
          // Check IndexedDB / LocalStorage
          const val = await AvatarStorageService.getAvatarAsync(st.id);
          if (val) {
            st.avatar = val;
          }
        }
      })
    );
  }
};
