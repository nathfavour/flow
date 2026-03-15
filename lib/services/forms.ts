import { tablesDB } from "../appwrite";
import { APPWRITE_CONFIG } from "../config";
import { ID, Query, Permission, Role } from "appwrite";
import { Forms, FormSubmissions } from "../../generated/appwrite/types";

const DATABASE_ID = APPWRITE_CONFIG.DATABASES.FLOW;
const FORMS_TABLE = APPWRITE_CONFIG.TABLES.FLOW.FORMS;
const SUBMISSIONS_TABLE = APPWRITE_CONFIG.TABLES.FLOW.FORM_SUBMISSIONS;

export const FormsService = {
    /**
     * Create a new form definition
     */
    async createForm(userId: string, data: Omit<Forms, '$id' | '$createdAt' | '$updatedAt' | '$permissions' | '$databaseId' | '$collectionId'>) {
        return await tablesDB.createRow<Forms>(
            DATABASE_ID,
            FORMS_TABLE,
            ID.unique(),
            {
                ...data,
                userId,
                status: data.status || 'draft',
            },
            [
                Permission.read(Role.user(userId)),
                Permission.update(Role.user(userId)),
                Permission.delete(Role.user(userId)),
            ]
        );
    },

    /**
     * Get a form by ID
     */
    async getForm(formId: string) {
        return await tablesDB.getRow<Forms>({
            databaseId: DATABASE_ID,
            tableId: FORMS_TABLE,
            rowId: formId
        });
    },

    /**
     * List forms for a user
     */
    async listUserForms(userId: string) {
        return await tablesDB.listRows<Forms>({
            databaseId: DATABASE_ID,
            tableId: FORMS_TABLE,
            queries: [
                Query.equal('userId', userId),
                Query.orderDesc('$createdAt')
            ]
        });
    },

    /**
     * Update a form definition
     */
    async updateForm(formId: string, data: Partial<Forms>) {
        const form = await this.getForm(formId);
        
        // Handle public access permissions if published
        let permissions = form.$permissions;
        if (data.status === 'published') {
            permissions = [
                ...permissions.filter(p => !p.includes('role:all')), // Avoid duplicates
                Permission.read(Role.any())
            ];
        } else if (data.status === 'draft') {
            permissions = permissions.filter(p => !p.includes('role:all'));
        }

        return await tablesDB.updateRow<Forms>(
            DATABASE_ID,
            FORMS_TABLE,
            formId,
            data,
            permissions
        );
    },

    /**
     * Delete a form
     */
    async deleteForm(formId: string) {
        return await tablesDB.deleteRow(
            DATABASE_ID,
            FORMS_TABLE,
            formId
        );
    },

    /**
     * Submit form data
     */
    async submitForm(formId: string, payload: string, userId?: string) {
        const form = await this.getForm(formId);
        
        if (form.status !== 'published') {
            throw new Error('This form is not accepting submissions.');
        }

        const permissions = [
            Permission.read(Role.user(form.userId)), // Form owner can read
            Permission.update(Role.user(form.userId)),
            Permission.delete(Role.user(form.userId)),
        ];

        if (userId) {
            permissions.push(Permission.read(Role.user(userId)));
        }

        return await tablesDB.createRow<FormSubmissions>(
            DATABASE_ID,
            SUBMISSIONS_TABLE,
            ID.unique(),
            {
                formId,
                userId: userId || null,
                payload,
                submittedAt: new Date().toISOString(),
            },
            permissions
        );
    },

    /**
     * List submissions for a specific form
     */
    async listSubmissions(formId: string) {
        return await tablesDB.listRows<FormSubmissions>({
            databaseId: DATABASE_ID,
            tableId: SUBMISSIONS_TABLE,
            queries: [
                Query.equal('formId', formId),
                Query.orderDesc('submittedAt')
            ]
        });
    }
};
