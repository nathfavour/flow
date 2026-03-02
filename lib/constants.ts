import { APPWRITE_CONFIG } from "./config";

// Application constants for Kylrix Flow

export const APP_CONFIG = {
  name: 'Kylrix Flow',
  tagline: 'Smart Task Navigation',
  description: 'The future of task orchestration inside the Kylrix ecosystem.',
  
  // Brand assets
  logo: {
    url: 'https://res.cloudinary.com/dr266qqeo/image/upload/v1764592030/kylrixflow2_mzoiz5.jpg',
    alt: 'Kylrix Flow Logo',
  },
  
  // Brand colors (for reference, actual theme colors are in theme/theme.ts)
  colors: {
    primary: '#00F0FF', // Cybernetic Teal
    secondary: '#A1A1AA', // Gunmetal
  },
} as const;

// Kylrix ecosystem app type
export interface EcosystemApp {
  id: string;
  label: string;
  subdomain: string;
  type: 'app' | 'accounts' | 'support';
  icon: string;
  color: string;
  description: string;
}

export const KYLRIX_DOMAIN = 'kylrix.space';
export const KYLRIX_AUTH_SUBDOMAIN = 'accounts';
export const KYLRIX_AUTH_URI = `https://${KYLRIX_AUTH_SUBDOMAIN}.${KYLRIX_DOMAIN}`;

// Kylrix ecosystem apps
export const ECOSYSTEM_APPS: EcosystemApp[] = [
  { id: 'note', label: 'Note', subdomain: 'note', type: 'app', icon: '📝', color: '#00F5FF', description: 'Cognitive extension and smart notes.' },
  { id: 'vault', label: 'Vault', subdomain: 'vault', type: 'app', icon: '🔐', color: '#8b5cf6', description: 'Secure vault and identity vault.' },
  { id: 'flow', label: 'Flow', subdomain: 'flow', type: 'app', icon: '🚀', color: '#10b981', description: 'Intelligent task orchestration.' },
  { id: 'connect', label: 'Connect', subdomain: 'connect', type: 'app', icon: '💬', color: '#ec4899', description: 'Secure bridge for communication.' },
  { id: 'id', label: 'Accounts', subdomain: KYLRIX_AUTH_SUBDOMAIN, type: 'accounts', icon: '🛡️', color: '#ef4444', description: 'Sovereign identity management.' },
];

export function getEcosystemUrl(subdomain: string) {
  if (!subdomain) {
    return '#';
  }

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  if (isLocalhost) {
    const ports: Record<string, number> = {
      accounts: 3000,
      note: 3001,
      vault: 3002,
      flow: 3003,
      connect: 3004,
      kylrix: 3005
    };
    const appId = subdomain === 'id' ? 'accounts' : subdomain;
    return `http://localhost:${ports[appId] || 3000}`;
  }

  return `https://${subdomain}.${KYLRIX_DOMAIN}`;
}
