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
interface EcosystemApp {
  name: string;
  shortName: string;
  icon: string;
  color: string;
  description: string;
  url: string;
  active?: boolean;
}

// Whisperr ecosystem apps
export const ECOSYSTEM_APPS: EcosystemApp[] = [
  { 
    name: 'WhisperrNote', 
    shortName: 'Note',
    icon: '📝', 
    color: '#6366f1', 
    description: 'Smart notes',
    url: '/note',
  },
  { 
    name: 'WhisperrFlow', 
    shortName: 'Flow',
    icon: '✅', 
    color: '#10b981', 
    description: 'Flow-based task navigation', 
    active: true,
    url: '/flow',
  },
  { 
    name: 'WhisperrMeet', 
    shortName: 'Meet',
    icon: '🎥', 
    color: '#ec4899', 
    description: 'Video meetings',
    url: '/meet',
  },
  { 
    name: 'WhisperrEvents', 
    shortName: 'Events',
    icon: '🎉', 
    color: '#f59e0b', 
    description: 'Event planning',
    url: '/events',
  },
  { 
    name: 'WhisperrCal', 
    shortName: 'Cal',
    icon: '📅', 
    color: '#3b82f6', 
    description: 'Calendar',
    url: '/cal',
  },
  { 
    name: 'WhisperrPass', 
    shortName: 'Pass',
    icon: '🔐', 
    color: '#8b5cf6', 
    description: 'Password manager',
    url: '/pass',
  },
  { 
    name: 'WhisperrAuth', 
    shortName: 'Auth',
    icon: '🛡️', 
    color: '#ef4444', 
    description: 'Authentication',
    url: '/auth',
  },
];
