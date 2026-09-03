/**
 * Ultra-resilient Multi-Store IndexedDB Storage Engine for Educational Games Skyline
 * Provides permanent storage for accounts, games, slides, homerooms
 * even if LocalStorage is cleared or limited by browser storage quotas.
 */

const DB_NAME = 'GVD_Educational_Games_DB';
const DB_VERSION = 2;
const STORE_SAVED_GAMES = 'saved_games';
const STORE_USERS = 'users';
const STORE_KEYVALUE = 'keyvalue_store';

function openDB() {
  return new Promise((resolve) => {
    if (!window.indexedDB) {
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_SAVED_GAMES)) {
        db.createObjectStore(STORE_SAVED_GAMES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_USERS)) {
        db.createObjectStore(STORE_USERS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_KEYVALUE)) {
        db.createObjectStore(STORE_KEYVALUE);
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.warn('IndexedDB open error:', event.target.error);
      resolve(null);
    };
  });
}

export const IDBStorageService = {
  // Generic key-value store (for slides, homerooms, etc.)
  setItem: async (key, value) => {
    try {
      const db = await openDB();
      if (!db) return false;
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_KEYVALUE, 'readwrite');
        const store = tx.objectStore(STORE_KEYVALUE);
        store.put(value, key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  },

  getItem: async (key) => {
    try {
      const db = await openDB();
      if (!db) return null;
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_KEYVALUE, 'readonly');
        const store = tx.objectStore(STORE_KEYVALUE);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  },

  // Save user account
  saveUser: async (userData) => {
    if (!userData || !userData.id) return false;
    try {
      const db = await openDB();
      if (!db) return false;
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_USERS, 'readwrite');
        const store = tx.objectStore(STORE_USERS);
        store.put(userData);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  },

  saveAllUsers: async (usersList) => {
    if (!Array.isArray(usersList)) return false;
    try {
      const db = await openDB();
      if (!db) return false;
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_USERS, 'readwrite');
        const store = tx.objectStore(STORE_USERS);
        usersList.forEach(u => {
          if (u && u.id) store.put(u);
        });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  },

  clearAndSaveAllUsers: async (usersList) => {
    if (!Array.isArray(usersList)) return false;
    try {
      const db = await openDB();
      if (!db) return false;
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_USERS, 'readwrite');
        const store = tx.objectStore(STORE_USERS);
        store.clear();
        usersList.forEach(u => {
          if (u && u.id) store.put(u);
        });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  },

  getAllUsers: async () => {
    try {
      const db = await openDB();
      if (!db) return [];
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_USERS, 'readonly');
        const store = tx.objectStore(STORE_USERS);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch (e) {
      return [];
    }
  },

  // Save or update a game in IndexedDB
  saveGame: async (gameData) => {
    if (!gameData || !gameData.id) return false;
    try {
      const db = await openDB();
      if (!db) return false;

      return new Promise((resolve) => {
        const tx = db.transaction(STORE_SAVED_GAMES, 'readwrite');
        const store = tx.objectStore(STORE_SAVED_GAMES);
        store.put(gameData);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  },

  // Save all games list
  saveAllGames: async (gamesList) => {
    if (!Array.isArray(gamesList)) return false;
    try {
      const db = await openDB();
      if (!db) return false;

      return new Promise((resolve) => {
        const tx = db.transaction(STORE_SAVED_GAMES, 'readwrite');
        const store = tx.objectStore(STORE_SAVED_GAMES);
        gamesList.forEach(g => {
          if (g && g.id) store.put(g);
        });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  },

  // Load all games from IndexedDB
  getAllGames: async () => {
    try {
      const db = await openDB();
      if (!db) return [];

      return new Promise((resolve) => {
        const tx = db.transaction(STORE_SAVED_GAMES, 'readonly');
        const store = tx.objectStore(STORE_SAVED_GAMES);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = req.result || [];
          resolve(Array.isArray(list) ? list : []);
        };
        req.onerror = () => resolve([]);
      });
    } catch (e) {
      return [];
    }
  },

  // Delete a game by ID from IndexedDB
  deleteGame: async (gameId) => {
    if (!gameId) return false;
    try {
      const db = await openDB();
      if (!db) return false;

      return new Promise((resolve) => {
        const tx = db.transaction(STORE_SAVED_GAMES, 'readwrite');
        const store = tx.objectStore(STORE_SAVED_GAMES);
        store.delete(gameId);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  }
};
