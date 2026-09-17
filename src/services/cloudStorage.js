/**
 * Cloud Storage & User Authentication Service for Sky-Line Educational Games
 * Enables cross-device dynamic user creation and authentication anywhere in the world.
 */

import { IDBStorageService } from './idbStorage';

const KV_ENDPOINTS = [
  'https://api.kvdb.io/skyline_gvd_users_eduvth_v1/users',
  'https://api.kvdb.io/skyline_gvd_users_eduvth_v2/users'
];

// System Default Central Supabase Cloud DB Configuration
const SYSTEM_DEFAULT_SUPABASE_URL = 'https://ebdzuzykdhyczqijxzjn.supabase.co';
const SYSTEM_DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZHp1enlrZGh5Y3pxaWp4empuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NDY0MjYsImV4cCI6MjEwNDQyMjQyNn0.eWSpAG14uwGsX2OOd2IdM4dSFl-DSotE9DQaRnz7kQs';

const getSupabaseCredentials = () => {
  let url = '';
  let key = '';

  if (typeof window !== 'undefined') {
    url = window.__SKYLINE_SUPABASE_URL__ || localStorage.getItem('skyline_supabase_url') || SYSTEM_DEFAULT_SUPABASE_URL;
    key = window.__SKYLINE_SUPABASE_KEY__ || localStorage.getItem('skyline_supabase_key') || SYSTEM_DEFAULT_SUPABASE_KEY;
  }

  if (!url && typeof process !== 'undefined' && process.env) {
    url = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL || SYSTEM_DEFAULT_SUPABASE_URL;
    key = process.env.REACT_APP_SUPABASE_KEY || process.env.SUPABASE_KEY || SYSTEM_DEFAULT_SUPABASE_KEY;
  }

  if (!url) url = SYSTEM_DEFAULT_SUPABASE_URL;
  if (!key) key = SYSTEM_DEFAULT_SUPABASE_KEY;

  // Asynchronously restore from IDB if missing in LocalStorage
  if (!key && typeof window !== 'undefined') {
    IDBStorageService.getItem('skyline_supabase_key').then(idbKey => {
      if (idbKey) {
        window.__SKYLINE_SUPABASE_KEY__ = idbKey;
        try { localStorage.setItem('skyline_supabase_key', idbKey); } catch (e) {}
      }
    }).catch(() => {});
  }

  return { url: url.trim(), key: key.trim() };
};

export const CloudStorageService = {
  getCredentials: getSupabaseCredentials,

  setCredentials: (url, key) => {
    if (typeof window !== 'undefined') {
      const cleanUrl = (url || '').trim();
      const cleanKey = (key || '').trim();

      if (cleanUrl) localStorage.setItem('skyline_supabase_url', cleanUrl);
      else localStorage.removeItem('skyline_supabase_url');

      if (cleanKey) localStorage.setItem('skyline_supabase_key', cleanKey);
      else localStorage.removeItem('skyline_supabase_key');
      
      window.__SKYLINE_SUPABASE_URL__ = cleanUrl;
      window.__SKYLINE_SUPABASE_KEY__ = cleanKey;

      if (cleanUrl) IDBStorageService.setItem('skyline_supabase_url', cleanUrl).catch(() => {});
      if (cleanKey) IDBStorageService.setItem('skyline_supabase_key', cleanKey).catch(() => {});
    }
  },

  /**
   * Fetch all cloud registered users with multi-endpoint failover
   */
  getCloudUsers: async () => {
    const { url, key } = getSupabaseCredentials();

    // 1. Primary: Try Supabase REST API if configured
    if (url && key) {
      try {
        const response = await fetch(`${url}/rest/v1/teachers_users?select=*`, {
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) return data;
        }
      } catch (e) {
        console.warn("Supabase getCloudUsers error:", e);
      }
    }

    // 2. Secondary Cloud CDN Endpoint: Fetch directly from GitHub CDN
    try {
      const cdnUrl = 'https://raw.githubusercontent.com/Philthienhao/Educational-Games-Sky-Line-/main/public/cloud_users.json?t=' + Date.now();
      const res = await fetch(cdnUrl, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {}

    // 3. Multi-endpoint KV fallback strategy
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

    // 2. Push to Supabase Cloud Storage if configured
    const { url, key } = getSupabaseCredentials();
    if (url && key) {
      try {
        fetch(`${url}/rest/v1/teachers_users`, {
          method: 'POST',
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(payload)
        }).catch(() => {});
      } catch (e) {}
    }

    // 3. Broadcast to KV endpoints
    try {
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

    try {
      const cloudUsers = await CloudStorageService.getCloudUsers();
      const matched = cloudUsers.find(u => {
        if (!u || !u.username || u.password === undefined) return false;
        return String(u.username).trim().toLowerCase() === cleanUser && String(u.password).trim() === cleanPass;
      });

      if (matched) {
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

      const { url, key } = getSupabaseCredentials();
      if (url && key && userId) {
        fetch(`${url}/rest/v1/teachers_users?id=eq.${encodeURIComponent(userId)}`, {
          method: 'DELETE',
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
          }
        }).catch(() => {});
      }
    } catch (e) {}
  },

  /**
   * Save Teacher Private Data (Saved Games, Homeroom, Slides) to Supabase, Vercel Serverless API, and redundant Cloud KV DB
   */
  saveUserPrivateCloudData: async (userId, dataType, data) => {
    if (!userId || !dataType || !data) return false;
    const cleanId = String(userId).trim();
    const storageKey = `${cleanId}_${dataType}`;

    const { url, key } = getSupabaseCredentials();

    let successCount = 0;

    // 1. If Supabase configured, save directly to Supabase REST API (100% 24/7 persistent)
    if (url && key) {
      try {
        const payload = {
          key: storageKey,
          data: data,
          updated_at: new Date().toISOString()
        };

        const res = await fetch(`${url}/rest/v1/user_data`, {
          method: 'POST',
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) successCount++;
      } catch (e) {
        console.warn(`Supabase saveUserPrivateCloudData error (${dataType}):`, e);
      }
    }

    // 2. Primary Vercel Serverless Endpoint (/api/storage)
    const endpoint = `/api/storage?userId=${encodeURIComponent(cleanId)}&dataType=${encodeURIComponent(dataType)}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) successCount++;
    } catch (e) {
      console.warn(`saveUserPrivateCloudData warning (${dataType}):`, e.message || e);
    }

    // 3. Fallback direct push to Redundant KV Cloud endpoints
    const fallbackUrls = [
      `https://api.kvdb.io/skyline_gvd_store_v1/${encodeURIComponent(storageKey)}`,
      `https://api.kvdb.io/skyline_gvd_store_v2/${encodeURIComponent(storageKey)}`
    ];

    for (const fUrl of fallbackUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const fRes = await fetch(fUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (fRes.ok) successCount++;
      } catch (e) {}
    }

    return successCount > 0;
  },

  /**
   * Get Teacher Private Data from Supabase, Vercel Serverless API, or Redundant Cloud KV DB
   */
  getUserPrivateCloudData: async (userId, dataType) => {
    if (!userId || !dataType) return null;
    const cleanId = String(userId).trim();
    const storageKey = `${cleanId}_${dataType}`;

    const { url, key } = getSupabaseCredentials();

    // 1. If Supabase configured, query Supabase REST API directly
    if (url && key) {
      try {
        const res = await fetch(`${url}/rest/v1/user_data?key=eq.${encodeURIComponent(storageKey)}&select=data`, {
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
          }
        });

        if (res.ok) {
          const rows = await res.json();
          if (Array.isArray(rows) && rows.length > 0 && rows[0].data !== undefined) {
            return rows[0].data;
          }
        }
      } catch (e) {
        console.warn(`Supabase getUserPrivateCloudData error (${dataType}):`, e);
      }
    }

    // 2. Vercel Serverless Endpoint (/api/storage)
    const endpoint = `/api/storage?userId=${encodeURIComponent(cleanId)}&dataType=${encodeURIComponent(dataType)}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data !== null && data !== undefined && !data.error) {
          return data;
        }
      }
    } catch (e) {
      console.warn(`getUserPrivateCloudData warning (${dataType}):`, e.message || e);
    }

    // 3. Fallback direct query to Redundant KV Cloud endpoints
    const fallbackUrls = [
      `https://api.kvdb.io/skyline_gvd_store_v1/${encodeURIComponent(storageKey)}`,
      `https://api.kvdb.io/skyline_gvd_store_v2/${encodeURIComponent(storageKey)}`
    ];

    for (const fUrl of fallbackUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(fUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const rawText = await res.text();
          if (rawText && rawText.trim()) {
            try {
              return JSON.parse(rawText);
            } catch (e) {
              return rawText;
            }
          }
        }
      } catch (e) {}
    }

    return null;
  }
};

