import { tablesDB } from "../appwrite";
import { APPWRITE_CONFIG } from "../config";

const DATABASE_ID = APPWRITE_CONFIG.DATABASES.CHAT;
const TABLE_ID = APPWRITE_CONFIG.TABLES.VAULT.USER; // 'user' table in chat DB is used for profiles

export const UsersService = {
    async getProfileById(userId: string) {
        try {
            return await tablesDB.getRow({
                databaseId: DATABASE_ID,
                tableId: TABLE_ID,
                rowId: userId
            });
        } catch (e) {
            console.error("Profile not found", e);
            return null;
        }
    },

    async updateProfile(userId: string, data: any) {
        return await tablesDB.updateRow({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
            rowId: userId,
            data
        });
    }
};
