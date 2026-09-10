// Vercel Serverless API Endpoint for Skyline Educational Games Persistent Cloud Storage
// Path: /api/storage

const UPSTASH_REST_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || 'https://skyline-gvd-store.upstash.io';
const UPSTASH_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';

const KV_SERVERS = [
  'https://api.kvdb.io/skyline_gvd_store_v1',
  'https://api.kvdb.io/skyline_gvd_store_v2'
];

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || 'https://ebdzuzykdhyczqijxzjn.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.REACT_APP_SUPABASE_KEY || '';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { userId, dataType, key } = req.query || {};
  const storageKey = key || (userId && dataType ? `${userId}_${dataType}` : null);

  if (!storageKey || storageKey === 'undefined_undefined') {
    return res.status(400).json({ error: 'Missing valid userId or dataType key' });
  }

  // --- POST: Save User Data to 24/7 Persistent Cloud Stores ---
  if (req.method === 'POST') {
    try {
      const bodyPayload = req.body;
      if (bodyPayload === undefined || bodyPayload === null) {
        return res.status(400).json({ error: 'Empty payload body' });
      }

      const stringifiedPayload = typeof bodyPayload === 'string' ? bodyPayload : JSON.stringify(bodyPayload);
      const updatedAt = new Date().toISOString();

      let savedSuccessfully = false;

      // 1. Primary: Save to Upstash Redis Cloud DB (24/7 Dedicated Serverless DB)
      if (UPSTASH_REST_URL && UPSTASH_REST_TOKEN) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);
          const upRes = await fetch(`${UPSTASH_REST_URL}/set/${encodeURIComponent(storageKey)}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${UPSTASH_REST_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(stringifiedPayload),
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          if (upRes.ok) savedSuccessfully = true;
        } catch (e) {
          console.warn("Upstash Redis POST warning:", e.message || e);
        }
      }

      // 2. Try Supabase REST DB if credentials configured
      if (SUPABASE_URL && SUPABASE_KEY) {
        try {
          const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/user_data`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
              key: storageKey,
              data: bodyPayload,
              updated_at: updatedAt
            })
          });
          if (sbRes.ok) savedSuccessfully = true;
        } catch (e) {
          console.warn("Supabase REST API POST warning:", e.message || e);
        }
      }

      // 3. Broadcast to redundant 24/7 Cloud KV Servers
      const kvPromises = KV_SERVERS.map(async (serverUrl) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);
          const kvRes = await fetch(`${serverUrl}/${encodeURIComponent(storageKey)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: stringifiedPayload,
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          return kvRes.ok;
        } catch (e) {
          return false;
        }
      });

      const kvResults = await Promise.all(kvPromises);
      if (kvResults.some(r => r === true)) savedSuccessfully = true;

      return res.status(200).json({ success: true, key: storageKey, updatedAt });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // --- GET: Fetch User Data from 24/7 Persistent Cloud Stores ---
  if (req.method === 'GET') {
    try {
      // 1. Primary: Read from Upstash Redis Cloud DB
      if (UPSTASH_REST_URL && UPSTASH_REST_TOKEN) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);
          const upRes = await fetch(`${UPSTASH_REST_URL}/get/${encodeURIComponent(storageKey)}`, {
            headers: { 'Authorization': `Bearer ${UPSTASH_REST_TOKEN}` },
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (upRes.ok) {
            const jsonRes = await upRes.json();
            const rawVal = jsonRes.result !== undefined ? jsonRes.result : jsonRes;
            if (rawVal) {
              try {
                const parsed = typeof rawVal === 'string' ? JSON.parse(rawVal) : rawVal;
                return res.status(200).json(parsed);
              } catch (e) {
                return res.status(200).json(rawVal);
              }
            }
          }
        } catch (e) {
          console.warn("Upstash Redis GET warning:", e.message || e);
        }
      }

      // 2. Try Supabase REST DB
      if (SUPABASE_URL && SUPABASE_KEY) {
        try {
          const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/user_data?key=eq.${encodeURIComponent(storageKey)}&select=data`, {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`
            }
          });
          if (sbRes.ok) {
            const rows = await sbRes.json();
            if (Array.isArray(rows) && rows.length > 0 && rows[0].data !== undefined) {
              return res.status(200).json(rows[0].data);
            }
          }
        } catch (e) {
          console.warn("Supabase REST API GET warning:", e.message || e);
        }
      }

      // 3. Try redundant Cloud KV Servers sequentially
      for (const serverUrl of KV_SERVERS) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);
          const kvRes = await fetch(`${serverUrl}/${encodeURIComponent(storageKey)}`, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (kvRes.ok) {
            const rawText = await kvRes.text();
            if (rawText && rawText.trim()) {
              try {
                const parsedData = JSON.parse(rawText);
                return res.status(200).json(parsedData);
              } catch (e) {
                return res.status(200).json(rawText);
              }
            }
          }
        } catch (e) {
          console.warn(`KV Server GET warning (${serverUrl}):`, e.message || e);
        }
      }

      return res.status(404).json({ error: 'Data not found on Cloud DB', key: storageKey });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}

