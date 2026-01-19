// Application constants for WhisperrFlow

export const APP_CONFIG = {
  name: 'WhisperrFlow',
  tagline: 'Smart Task Navigation',
  description: 'The future of task orchestration inside the Whisperr ecosystem.',
  
  // Brand assets
  logo: {
    url: 'https://res.cloudinary.com/dr266qqeo/image/upload/v1764592030/whisperrflow2_mzoiz5.jpg',
    alt: 'WhisperrFlow Logo',
  },
  
  // Brand colors (for reference, actual theme colors are in theme/theme.ts)
  colors: {
    primary: '#00F0FF', // Cybernetic Teal
    secondary: '#A1A1AA', // Gunmetal
  },
} as const;

// Whisperr ecosystem app type
export interface EcosystemApp {
  id: string;
  label: string;
  subdomain: string;
  type: 'app' | 'accounts' | 'support';
  icon: string;
  color: string;
  description: string;
}

export const NEXT_PUBLIC_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'whisperrnote.space';

// Whisperr ecosystem apps
export const ECOSYSTEM_APPS: EcosystemApp[] = [
  { id: 'note', label: 'Note', subdomain: 'app', type: 'app', icon: '📝', color: '#00F5FF', description: 'Cognitive extension and smart notes.' },
  { id: 'keep', label: 'Keep', subdomain: 'keep', type: 'app', icon: '🔐', color: '#8b5cf6', description: 'Secure vault and identity vault.' },
  { id: 'flow', label: 'Flow', subdomain: 'flow', type: 'app', icon: '🚀', color: '#10b981', description: 'Intelligent task orchestration.' },
  { id: 'connect', label: 'Connect', subdomain: 'connect', type: 'app', icon: '💬', color: '#ec4899', description: 'Secure bridge for communication.' },
  { id: 'id', label: 'Identity', subdomain: 'id', type: 'accounts', icon: '🛡️', color: '#ef4444', description: 'Sovereign identity management.' },
];

export function getEcosystemUrl(subdomain: string) {
  if (!subdomain) {
    return '#';
  }
  return `https://${subdomain}.${NEXT_PUBLIC_DOMAIN}`;
}

