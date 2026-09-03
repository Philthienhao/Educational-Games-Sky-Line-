/**
 * Cloud Storage & User Authentication Service for Sky-Line Educational Games
 * Enables cross-device dynamic user creation and authentication anywhere in the world.
 */

import { IDBStorageService } from './idbStorage';

const KV_ENDPOINTS = [
  'https://api.kvdb.io/skyline_gvd_users_eduvth_v1/users',
  'https://api.kvdb.io/skyline_gvd_users_eduvth_v2/users'
];

// Custom Supabase / Cloud DB Configuration (Can be configured via env or window)
const SUPABASE_URL = typeof window !== 'undefined' && window.__SKYLINE_SUPABASE_URL__ ? window.__SKYLINE_SUPABASE_URL__ : '';
const SUPABASE_KEY = typeof window !== 'undefined' && window.__SKYLINE_SUPABASE_KEY__ ? window.__SKYLINE_SUPABASE_KEY__ : '';

export const CloudStorageService = {
  /**
   * Fetch all cloud registered users with multi-endpoint failover
   */
  getCloudUsers: async () => {
    // 1. If Supabase configured, try Supabase REST API
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/teachers_users?select=*`, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) return data;
        }
      } catch (e) {}
    }

    // 2. Multi-endpoint KV fallback strategy (tries primary, then secondary)
    for (const endpoint of KV_ENDPOINTS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const response = await fetch(endpoint, { signal: controller.signal }).catch(() => null);
        clearTimeout(timeoutId);

        if (response && response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length >= 0) return data;
        }
      } catch (e) {
        console.warn("CloudStorageService endpoint fetch info:", e.message || e);
      }
    }

    return [];
  },

  /**
   * Create or update a user on Cloud Storage across all redundant endpoints
   */
  createOrUpdateCloudUser: async (userData) => {
    if (!userData || !userData.username) return false;

    const cleanUname = String(userData.username).trim().toLowerCase();
    const cleanPass = userData.password !== undefined && userData.password !== null ? String(userData.password).trim() : '';

    const payload = {
      id: userData.id || `user_${Date.now()}`,
      username: cleanUname,
      password: cleanPass,
      name: userData.name || userData.username,
      role: userData.role || 'teacher',
      subject: userData.subject || 'Giáo viên',
      school: userData.school || 'Hệ thống Giáo Dục Sky-Line',
      createdAt: userData.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString()
    };

    // 1. Save locally to IndexedDB + LocalStorage immediately
    try {
      let localUsers = JSON.parse(localStorage.getItem('gvd_users') || '[]');
      localUsers = localUsers.filter(u => !u.username || String(u.username).trim().toLowerCase() !== cleanUname);
      localUsers.push(payload);
      localStorage.setItem('gvd_users', JSON.stringify(localUsers));
      IDBStorageService.clearAndSaveAllUsers(localUsers).catch(() => {});
    } catch (e) {}

    // 2. Push to Cloud Storage asynchronously across all endpoints
    try {
      if (SUPABASE_URL && SUPABASE_KEY) {
        fetch(`${SUPABASE_URL}/rest/v1/teachers_users`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(payload)
        }).catch(() => {});
      }

      // Prepare combined safe user list (local + cloud)
      let localUsersList = [];
      try {
        localUsersList = JSON.parse(localStorage.getItem('gvd_users') || '[]');
      } catch (e) {}

      const currentCloudUsers = await CloudStorageService.getCloudUsers();
      const combinedMap = new Map();
      [...localUsersList, ...currentCloudUsers].forEach(u => {
        if (u && u.username) {
          combinedMap.set(String(u.username).trim().toLowerCase(), u);
        }
      });
      combinedMap.set(cleanUname, payload);
      const updatedList = Array.from(combinedMap.values());

      // Broadcast to ALL redundant KV endpoints simultaneously
      KV_ENDPOINTS.forEach(endpoint => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedList),
          signal: controller.signal
        }).then(() => clearTimeout(timeoutId)).catch(() => clearTimeout(timeoutId));
      });

      return payload;
    } catch (e) {
      console.warn("CloudStorageService.createOrUpdateCloudUser cloud push warning:", e);
    }

    return payload;
  },

  /**
   * Authenticate user against Local DB + Cloud DB (Cross-device capable)
   */
  authenticateCloudUser: async (username, password) => {
    if (!username || !password) return null;

    const cleanUser = String(username).trim().toLowerCase();
    const cleanPass = String(password).trim();

    // 1. Check cloud DB for newly created accounts on other devices
    try {
      const cloudUsers = await CloudStorageService.getCloudUsers();
      const matched = cloudUsers.find(u => {
        if (!u || !u.username || u.password === undefined) return false;
        return String(u.username).trim().toLowerCase() === cleanUser && String(u.password).trim() === cleanPass;
      });

      if (matched) {
        // Cache user locally so subsequent logins & offline mode work instantly
        try {
          let localUsers = JSON.parse(localStorage.getItem('gvd_users') || '[]');
          const existsIdx = localUsers.findIndex(u => u && u.username && String(u.username).trim().toLowerCase() === cleanUser);
          if (existsIdx >= 0) {
            localUsers[existsIdx] = { ...localUsers[existsIdx], ...matched };
          } else {
            localUsers.push(matched);
          }
          localStorage.setItem('gvd_users', JSON.stringify(localUsers));
          IDBStorageService.clearAndSaveAllUsers(localUsers).catch(() => {});
        } catch (e) {}

        return matched;
      }
    } catch (e) {
      console.warn("Cloud authentication fallback to local:", e);
    }

    return null;
  },

  /**
   * Delete user from Cloud
   */
  deleteCloudUser: async (userId, username) => {
    try {
      const cleanUser = username ? String(username).trim().toLowerCase() : '';
      const currentCloudUsers = await CloudStorageService.getCloudUsers();
      const filtered = currentCloudUsers.filter(u => {
        if (userId && u.id === userId) return false;
        if (cleanUser && u.username && String(u.username).trim().toLowerCase() === cleanUser) return false;
        return true;
      });

      KV_ENDPOINTS.forEach(endpoint => {
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filtered)
        }).catch(() => {});
      });
    } catch (e) {}
  }
};
