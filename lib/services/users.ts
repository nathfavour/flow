import { tablesDB } from "../appwrite/client";
import { APPWRITE_CONFIG } from "../appwrite/config";

const DATABASE_ID = APPWRITE_CONFIG.DATABASES.CHAT;
const TABLE_ID = APPWRITE_CONFIG.TABLES.CHAT.PROFILES;

const normalizeProfile = (profile: any) => {
    if (!profile) return null;
    return {
        ...profile,
        id: profile.$id,
        title: profile.displayName || profile.username,
        subtitle: `@${profile.username}`,
        avatar: profile.avatar,
        profilePicId: profile.profilePicId || profile.avatar,
    };
};

export const UsersService = {
    async getProfileById(userId: string) {
        try {
            return await tablesDB.getRow({
                databaseId: DATABASE_ID,
                tableId: TABLE_ID,
                rowId: userId
            });
        } catch (_e: any) {
            try {
                const { Query } = await import("appwrite");
                const res = await tablesDB.listRows<any>({
                    databaseId: DATABASE_ID,
                    tableId: TABLE_ID,
                    queries: [
                        Query.or([
                            Query.equal('userId', userId),
                            Query.equal('$id', userId)
                        ]),
                        Query.limit(1),
                        Query.select(['$id', 'userId', 'username', 'displayName', 'bio', 'avatar', 'profilePicId', 'publicKey', 'appsActive', 'createdAt', '$createdAt'])
                    ]
                });
                return normalizeProfile(res.rows[0]) || null;
            } catch (_inner) {
                return null;
            }
        }
    },

    async updateProfile(userId: string, data: any) {
        const profile = await this.getProfileById(userId);
        if (profile) {
            return await tablesDB.updateRow(
                DATABASE_ID,
                TABLE_ID,
                profile.$id || profile.id,
                data
            );
        }
        return null;
    },

    async createProfile(userId: string, username: string, data: any = {}) {
        const { Permission, Role } = await import("appwrite");
        return await tablesDB.createRow(
            DATABASE_ID,
            TABLE_ID,
            userId,
            {
                userId,
                username,
                displayName: data.displayName || username,
                appsActive: data.appsActive || ['flow'],
                publicKey: data.publicKey || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                bio: data.bio || ''
            },
            [
                Permission.read(Role.any()),
                Permission.update(Role.user(userId)),
                Permission.delete(Role.user(userId))
            ]
        );
    },

    async isUsernameAvailable(username: string): Promise<boolean> {
        try {
            const { Query } = await import("appwrite");
                const res = await tablesDB.listRows<any>({
                    databaseId: DATABASE_ID,
                    tableId: TABLE_ID,
                    queries: [
                        Query.equal('username', username.toLowerCase()),
                        Query.limit(1),
                        Query.select(['$id', 'userId', 'username', 'displayName', 'bio', 'avatar', 'profilePicId', 'publicKey', 'appsActive', 'createdAt', '$createdAt'])
                    ]
                });
            return res.rows.length === 0;
        } catch (_e) {
            return false;
        }
    },

    async searchUsers(query: string) {
        const cleaned = query.trim().replace(/^@/, '');
        if (cleaned.length < 2) return [];

        const { Query } = await import("appwrite");
            const res = await tablesDB.listRows<any>({
                databaseId: DATABASE_ID,
                tableId: TABLE_ID,
                queries: [
                    Query.or([
                        Query.startsWith('username', cleaned.toLowerCase()),
                        Query.startsWith('displayName', cleaned)
                    ]),
                    Query.limit(20),
                    Query.select(['$id', 'userId', 'username', 'displayName', 'bio', 'avatar', 'profilePicId', 'publicKey', 'appsActive', 'createdAt', '$createdAt'])
                ]
            });

        return res.rows.map(normalizeProfile).filter(Boolean);
    }
};
