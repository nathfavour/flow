import { tablesDB, account } from '../appwrite';
import { APPWRITE_CONFIG } from '../config';

const CONNECT_DATABASE_ID = 'chat';
const CONNECT_COLLECTION_ID_USERS = 'users';

const PROFILE_SYNC_KEY = 'kylrix_ecosystem_identity_synced';
const SESSION_SYNC_KEY = 'kylrix_ecosystem_session_synced';

/**
 * Ensures the user has a record in the global Kylrix Connect Directory.
 * Uses a multi-layered cache check (session + local) to minimize DB calls.
 */
export async function ensureGlobalIdentity(user: any, force = false) {
    if (!user?.$id) return;

    if (typeof window !== 'undefined' && !force) {
        // Step 1: Session skip
        if (sessionStorage.getItem(SESSION_SYNC_KEY)) return;

        // Step 2: Global skip
        const lastSync = localStorage.getItem(PROFILE_SYNC_KEY);
        if (lastSync && (Date.now() - parseInt(lastSync)) < 24 * 60 * 60 * 1000) {
            sessionStorage.setItem(SESSION_SYNC_KEY, '1');
            return;
        }
    }

    try {
        let profile;
        try {
            profile = await tablesDB.getRow({
                databaseId: CONNECT_DATABASE_ID,
                tableId: CONNECT_COLLECTION_ID_USERS,
                rowId: user.$id
            });
        } catch (e: any) {
            if (e.code === 404) {
                // Create new global profile
                const username = user.prefs?.username || `user${user.$id.slice(0, 6)}`;
                const profilePicId = user.prefs?.profilePicId || null;

                const baseData = {
                    username,
                    displayName: user.name || username,
                    appsActive: ['flow'],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    bio: '',
                    privacySettings: JSON.stringify({ public: true })
                };

                const permissions = [
                    'read("any")',
                    `update("user:${user.$id}")`,
                    `delete("user:${user.$id}")`
                ];

                const avatarFieldCandidates = ['profilePicId', 'avatarFileId', 'avatarUrl'];

                for (const field of avatarFieldCandidates) {
                    try {
                        const payload: any = { ...baseData };
                        if (profilePicId) payload[field] = profilePicId;

                        profile = await tablesDB.createRow({
                            databaseId: CONNECT_DATABASE_ID,
                            tableId: CONNECT_COLLECTION_ID_USERS,
                            rowId: user.$id,
                            data: payload,
                            permissions
                        });
                        break;
                    } catch (inner: any) {
                        const msg = (inner.message || JSON.stringify(inner)).toLowerCase();
                        if (msg.includes('unknown attribute')) continue;
                        throw inner;
                    }
                }
            } else {
                throw e;
            }
        }

        if (profile && Array.isArray(profile.appsActive) && !profile.appsActive.includes('flow')) {
            await tablesDB.updateRow({
                databaseId: CONNECT_DATABASE_ID,
                tableId: CONNECT_COLLECTION_ID_USERS,
                rowId: user.$id,
                data: {
                    appsActive: [...profile.appsActive, 'flow'],
                    updatedAt: new Date().toISOString()
                }
            });
        }

        if (typeof window !== 'undefined') {
            localStorage.setItem(PROFILE_SYNC_KEY, Date.now().toString());
            sessionStorage.setItem(SESSION_SYNC_KEY, '1');
        }
    } catch (error) {
        console.warn('[Identity] Global identity sync failed:', error);
    }
}

import { Query } from 'appwrite';

/**
 * Searches for users across the entire ecosystem.
 */
export async function searchGlobalUsers(query: string, limit = 10) {
    if (!query || query.length < 2) return [];

    try {
        const res = await tablesDB.listRows({
            databaseId: CONNECT_DATABASE_ID,
            tableId: CONNECT_COLLECTION_ID_USERS,
            queries: [
                Query.or([
                    Query.startsWith('username', query.toLowerCase()),
                    Query.startsWith('displayName', query)
                ]),
                Query.limit(limit)
            ]
        });

        return res.rows.map((doc: any) => ({
            id: doc.$id,
            title: doc.displayName || doc.username,
            subtitle: `@${doc.username}`,
            avatar: doc.avatarUrl,
            profilePicId: doc.avatarFileId || doc.profilePicId,
            apps: doc.appsActive || []
        }));
    } catch (error) {
        console.error('[Identity] Global search failed:', error);
        return [];
    }
}
