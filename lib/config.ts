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
  FUNCTIONS: {
    SEARCH_USERS: '69a582720012957d2027',
    SYNC_USER_PROFILE: '69a583ac002b674685b0',
    NOTIFY_ON_SHARE: '69a58c1c001c39695bf6',
    NOTIFY_ON_SOCIAL_ACTIVITY: '69a6bf6200180e70aca1',
    FLOW_EVENT_SYNC: '69a6c28f003bb7d7e054',
    LOG_SECURITY_EVENT: '69a6c45a002085baa8dd',
    SYNC_SUBSCRIPTION_STATUS: '69a6c56d00203438232c',
    ACCOUNT_CLEANUP: '69a6c6fc001dc877979d',
    CONNECT_CALL_CLEANUP: '69a6c841000b2c5aaae3'
  },
  AUTH: {
    SUBDOMAIN: 'accounts',
    DOMAIN: 'kylrix.space',
  }
};
