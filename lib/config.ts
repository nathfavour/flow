import { PROJECT_ID, ENDPOINT } from '../generated/appwrite/constants';

const getRequiredEnv = (key: string, value: string | undefined): string => {
  if (!value) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(`[config] Missing environment variable: ${key}. Using placeholder for build.`);
      return '';
    }
    return ''; // Return empty instead of throwing to avoid build issues
  }
  return value;
};

export const APPWRITE_CONFIG = {
  ENDPOINT,
  PROJECT_ID,
  DATABASE_ID: 'whisperrflow',
  DATABASES: {
    NOTE: '67ff05a9000296822396',
    VAULT: 'passwordManagerDb',
    FLOW: 'whisperrflow',
    CHAT: 'chat'
  },
  TABLES: {
    CALENDARS: 'calendars',
    TASKS: 'tasks',
    EVENTS: 'events',
    EVENT_GUESTS: 'eventGuests',
    FOCUS_SESSIONS: 'focusSessions',
    NOTES: '67ff05f3002502ef239e',
    VAULT: {
      CREDENTIALS: 'credentials',
      TOTP_SECRETS: 'totpSecrets',
      FOLDERS: 'folders',
      SECURITY_LOGS: 'securityLogs',
      USER: 'user',
      KEYCHAIN: 'keychain'
    },
    FLOW: {
      TASKS: 'tasks',
      EVENTS: 'events',
      GUESTS: 'eventGuests'
    }
  },
  NOTE_DATABASE_ID: '67ff05a9000296822396',
  BUCKETS: {
    TASK_ATTACHMENTS: 'task_attachments',
    EVENT_COVERS: 'event_covers',
  },
  AUTH: {
    SUBDOMAIN: 'accounts',
    DOMAIN: 'kylrix.space',
  }
};
