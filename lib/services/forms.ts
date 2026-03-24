import { tablesDB, getCurrentUser } from "../appwrite/client";
import { APPWRITE_CONFIG } from "../appwrite/config";
import { ID, Query, Permission, Role } from "appwrite";
import { Forms, FormSubmissions, ActivityLogCreate, FormSubmissionsStatus } from "../../generated/appwrite/types";

const DATABASE_ID = APPWRITE_CONFIG.DATABASES.FLOW;
const FORMS_TABLE = APPWRITE_CONFIG.TABLES.FLOW.FORMS;
const SUBMISSIONS_TABLE = APPWRITE_CONFIG.TABLES.FLOW.FORM_SUBMISSIONS;
const ACTIVITY_LOG_TABLE = "activityLog";
const NOTE_DATABASE_ID = APPWRITE_CONFIG.NOTE_DATABASE_ID;

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
        Permission.read(Role.any()), // Allow public discovery via listRows filter
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
    ]
);
    },

    /**
     * Get a form by ID (Public Access Support)
     */
    async getForm(formId: string) {
        // We use listRows with a query instead of getRow to bypass strict ownership 
        // if the form is published and the user is anonymous.
        // Also ensure we target the correct table ID from config
        const res = await tablesDB.listRows<Forms>({
            databaseId: DATABASE_ID,
            tableId: FORMS_TABLE,
            queries: [
                Query.equal('$id', formId)
            ]
        });

        if (res.total === 0) {
            throw new Error(`Form [${formId}] not found or inaccessible in ${FORMS_TABLE}.`);
        }

        return res.rows[0];
    },

    /**
     * Internal: Resolve current user
     */
    async getCurrentUser() {
        return await getCurrentUser();
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
    /**
     * Update a form definition with strict permission synchronization
     */
    async updateForm(formId: string, data: Partial<Forms>) {
        const form = await this.getForm(formId);
        const userId = form.userId;
        
        // 1. Determine current state (merged from existing + incoming updates)
        const currentStatus = data.status || form.status;

        // 2. Build the exact permission set for this form row
        // We always ensure the owner has full control
        const permissions = [
            Permission.read(Role.user(userId)),
            Permission.update(Role.user(userId)),
            Permission.delete(Role.user(userId)),
        ];

        // 3. Apply Visibility Logic:
        // If status is 'published', allow Guest (any) read access to the form metadata/schema
        if (currentStatus === 'published') {
            permissions.push(Permission.read(Role.any()));
        }

        // Note: 'allowAnonymousFill' doesn't change the Form row's permissions,
        // it's a logic gate in submitForm() and affects the Submissions table permissions.

        console.log(`Syncing permissions for form ${formId}:`, permissions);

        return await tablesDB.updateRow<Forms>(
            DATABASE_ID,
            FORMS_TABLE,
            formId,
            data,
            permissions
        );
    },

    /**
     * Submit form data
     */
    async submitForm(formId: string, payload: string, userId?: string) {
        // Use listRows to bypass potential SDK-level getRow restrictions for anonymous users
        const formRes = await tablesDB.listRows<Forms>({
            databaseId: DATABASE_ID,
            tableId: FORMS_TABLE,
            queries: [Query.equal('$id', formId)]
        });

        if (formRes.total === 0) {
            throw new Error('Form configuration not found.');
        }

        const form = formRes.rows[0];
        
        if (form.status !== 'published') {
            throw new Error('This form is not accepting submissions.');
        }

        // Check expiry
        let settings: any = {};
        try {
            settings = JSON.parse(form.settings || '{}');
        } catch (_e) {}

        if (settings.expiresAt) {
            const expiry = new Date(settings.expiresAt);
            if (expiry < new Date()) {
                throw new Error('This form has expired and is no longer accepting responses.');
            }
        }

        // Check anonymous fill
        const allowAnonymousFill = settings.allowAnonymousFill ?? false;
        
        if (!userId && !allowAnonymousFill) {
             const currentUser = await getCurrentUser();
             if (!currentUser) {
                throw new Error('Authentication required to submit this form.');
             }
        }

        // Submissions Table permissions:
        // 1. Owner can READ/UPDATE/DELETE
        const submissionPermissions = [
            Permission.read(Role.user(form.userId)),
            Permission.update(Role.user(form.userId)),
            Permission.delete(Role.user(form.userId)),
        ];

        // 2. If user is logged in, allow THEM to read their own submission later
        let submitterId = userId;
        if (!submitterId) {
            const currentUser = await getCurrentUser();
            if (currentUser?.$id) {
                submitterId = currentUser.$id;
            }
        }

        if (submitterId) {
            submissionPermissions.push(Permission.read(Role.user(submitterId)));
        }

        const submission = await tablesDB.createRow<FormSubmissions>(
            DATABASE_ID,
            SUBMISSIONS_TABLE,
            ID.unique(),
            {
                formId,
                submitterId: submitterId || null,
                payload,
                status: FormSubmissionsStatus.UNREAD,
                metadata: JSON.stringify({
                    submittedAt: new Date().toISOString(),
                })
            },
            submissionPermissions
        );

        // Notify form owner via ActivityLog
        try {
            await tablesDB.createRow<ActivityLogCreate>(
                NOTE_DATABASE_ID,
                ACTIVITY_LOG_TABLE,
                ID.unique(),
                {
                    userId: form.userId,
                    action: `New submission received for form: ${form.title}`,
                    targetType: 'form',
                    targetId: formId,
                    timestamp: new Date().toISOString(),
                    details: JSON.stringify({
                        read: false,
                        submissionId: submission.$id,
                        formTitle: form.title
                    })
                },
                [
                    Permission.read(Role.user(form.userId)),
                    Permission.update(Role.user(form.userId)),
                    Permission.delete(Role.user(form.userId)),
                ]
            );
        } catch (e) {
            console.error('Failed to create notification activity log', e);
        }

        return submission;
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
     * List submissions for a specific form with submitter enrichment
     */
    async listSubmissions(formId: string) {
        const res = await tablesDB.listRows<FormSubmissions>({
            databaseId: DATABASE_ID,
            tableId: SUBMISSIONS_TABLE,
            queries: [
                Query.equal('formId', formId),
                Query.orderDesc('$createdAt')
            ]
        });

        // Enrich with usernames from Chat database if submitterId exists
        const submitterIds = Array.from(new Set(res.rows.map(r => r.submitterId).filter(Boolean))) as string[];
        
        if (submitterIds.length > 0) {
            try {
                const userRes = await tablesDB.listRows<any>({
                    databaseId: APPWRITE_CONFIG.DATABASES.CHAT,
                    tableId: 'users', 
                    queries: [Query.equal('$id', submitterIds)] 
                });
                
                // Map of userId -> username
                const userMap = new Map(userRes.rows.map((u: any) => [u.$id, u.username || u.displayName || u.$id]));
                
                return {
                    ...res,
                    rows: res.rows.map(row => ({
                        ...row,
                        submitterName: row.submitterId ? (userMap.get(row.submitterId) || row.submitterId) : 'Anonymous'
                    }))
                };
            } catch (e) {
                console.error('[Forms] Failed to enrich submitter names', e);
            }
        }

        return {
            ...res,
            rows: res.rows.map(row => ({
                ...row,
                submitterName: row.submitterId ? row.submitterId : 'Anonymous'
            }))
        };
    },

    /**
     * Update submission metadata (e.g., read status)
     */
    async updateSubmission(submissionId: string, data: Partial<FormSubmissions>) {
        return await tablesDB.updateRow<FormSubmissions>(
            DATABASE_ID,
            SUBMISSIONS_TABLE,
            submissionId,
            data
        );
    }
};
