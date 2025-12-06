
// --- CONSTANTS ---

// OBFUSCATION: Credentials are loaded from Environment Variables
const getEnv = (key: string) => {
  let value = '';

  // 1. Try Vite (import.meta.env)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      value = import.meta.env[key];
    }
  } catch (e) {
    // Ignore error
  }

  // 2. Try Process (process.env) - Fallback
  if (!value) {
    try {
      // @ts-ignore
      if (typeof process !== 'undefined' && process.env) {
        // @ts-ignore
        value = process.env[key];
      }
    } catch (e) {
      // Ignore error
    }
  }

  // 3. Try Legacy React App (REACT_APP_)
  if (!value && key.startsWith('VITE_')) {
    const legacyKey = key.replace('VITE_', 'REACT_APP_');
    try {
      // @ts-ignore
      if (typeof process !== 'undefined' && process.env) {
        // @ts-ignore
        value = process.env[legacyKey];
      }
    } catch (e) {
       // Ignore
    }
  }

  return value || '';
};

export const AUTH_HASH = {
  // Expecting Base64 encoded strings in .env
  // FALLBACK ADDED: Default hash for 'hoangfnee' / 'Ho@ng2310' ensures login works in Preview/Dev immediately
  U: getEnv('VITE_ADMIN_USER_HASH') || 'aG9hbmdmbmVl',
  P: getEnv('VITE_ADMIN_PASS_HASH') || 'SG9AbmcyMzEw'
};

export const STORAGE_KEYS = {
  DIARY: 'db_diary',
  BUSY: 'db_busy_data',
  REQUESTS: 'db_requests',
  USER_ACTION: 'sys_user_action',
  FAVS: 'db_favs'
};

// --- HELPER FUNCTIONS ---

export const getStorage = <T,>(key: string, defaultVal: T): T => {
  if (typeof window === 'undefined') return defaultVal;
  const stored = localStorage.getItem(key);
  if (!stored) return defaultVal;
  try { return JSON.parse(stored); } catch { return defaultVal; }
};

export const setStorage = <T,>(key: string, val: T) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(val));
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};
