'use client';

import { useState, useCallback, useEffect } from 'react';

export type KylrixAppId = 'accounts' | 'note' | 'vault' | 'flow' | 'connect';

const LAST_APP_KEY = 'kylrix_last_active_app';
const DEFAULT_APP: KylrixAppId = 'connect';

export interface UseLastActiveAppReturn {
  appId: KylrixAppId;
  lastAppId: KylrixAppId | null;
  setLastActiveApp: (appId: KylrixAppId) => void;
}

/**
 * Detect which Kylrix app the user is currently in by parsing window.location
 */
export function detectCurrentApp(): KylrixAppId | null {
  if (typeof window === 'undefined') return null;

  const hostname = window.location.hostname.toLowerCase();

  // Parse: accounts.kylrix.space, accounts.localhost, localhost:3000, etc.
  if (hostname.includes('accounts')) return 'accounts';
  if (hostname.includes('note')) return 'note';
  if (hostname.includes('vault')) return 'vault';
  if (hostname.includes('flow')) return 'flow';
  if (hostname.includes('connect')) return 'connect';

  // Local dev: check port number
  const port = window.location.port;
  if (port === '3000') return 'accounts';
  if (port === '3001') return 'note';
  if (port === '3002') return 'vault';
  if (port === '3003') return 'flow';
  if (port === '3004') return 'connect';

  return null;
}

/**
 * Get the last active app, or default to 'connect' if none found
 */
export function getLastActiveApp(): KylrixAppId {
  if (typeof window === 'undefined') return DEFAULT_APP;
  const saved = localStorage.getItem(LAST_APP_KEY) as KylrixAppId | null;
  return saved || DEFAULT_APP;
}

/**
 * Get the full redirect URL for the last active app dashboard
 * Used in kylrix landing page for auto-redirect on login
 */
export function getLastActiveAppRedirectUrl(baseUrl: string): string {
  const app = getLastActiveApp();
  const baseUri = baseUrl.replace(/\/$/, '');
  
  // Map each app to its dashboard equivalent
  const dashboards: Record<KylrixAppId, string> = {
    accounts: '/settings',
    note: '/dashboard',
    vault: '/dashboard',
    flow: '/dashboard',
    connect: '/dashboard',
  };

  return `${baseUri}${dashboards[app]}`;
}

/**
 * Hook to track the user's last active app in the Kylrix ecosystem.
 * Persists to localStorage and provides navigation helpers.
 */
export function useLastActiveApp(): UseLastActiveAppReturn {
  const [appId] = useState<KylrixAppId>('flow');
  const [lastAppId, setLastAppIdState] = useState<KylrixAppId | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LAST_APP_KEY);
      
      // Defer state updates to avoid cascading renders in the same tick
      Promise.resolve().then(() => {
        if (stored) {
          setLastAppIdState(stored as KylrixAppId);
        }
        
        // Auto-track current app if detected
        const current = detectCurrentApp();
        if (current) {
          localStorage.setItem(LAST_APP_KEY, current);
          setLastAppIdState(current);
        }
      });
    }
  }, []);

  const setLastActiveApp = useCallback((newAppId: KylrixAppId) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LAST_APP_KEY, newAppId);
      setLastAppIdState(newAppId);
    }
  }, []);

  return {
    appId,
    lastAppId: lastAppId || DEFAULT_APP,
    setLastActiveApp,
  };
}
