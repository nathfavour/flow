import { ID, Models } from "appwrite";
import { tablesDB, realtime } from "./appwrite";
import { APPWRITE_CONFIG } from "./config";
import { Calendar, Task, Event, EventGuest, FocusSession } from "../types/whisperrflow";

const { DATABASE_ID, TABLES } = APPWRITE_CONFIG;

export { realtime };

export function subscribeToTable<T extends Models.Row>(
    tableId: string, 
    callback: (event: { type: 'create' | 'update' | 'delete', payload: T }) => void
) {
    const channel = `databases.${DATABASE_ID}.collections.${tableId}.documents`;
    
    return realtime.subscribe(channel, (response) => {
        const payload = response.payload as T;
        let type: 'create' | 'update' | 'delete' | null = null;

        if (response.events.some(e => e.includes('.create'))) type = 'create';
        else if (response.events.some(e => e.includes('.update'))) type = 'update';
        else if (response.events.some(e => e.includes('.delete'))) type = 'delete';

        if (type) {
            callback({ type, payload });
        }
    });
}

type TableCreateData<T extends Models.Row> =
    T extends Models.DefaultRow
        ? Partial<Models.Row> & Record<string, unknown>
        : Partial<Models.Row> & Omit<T, keyof Models.Row>;
type TableUpdateData<T extends Models.Row> =
    T extends Models.DefaultRow
        ? Partial<Models.Row> & Record<string, unknown>
        : Partial<Models.Row> & Partial<Omit<T, keyof Models.Row>>;

async function listRows<T extends Models.Row>(tableId: string, queries?: string[]): Promise<Models.RowList<T>> {
    return await tablesDB.listRows<T>({ databaseId: DATABASE_ID, tableId, queries });
}

async function createRow<T extends Models.Row>(
    tableId: string, 
    data: TableCreateData<T>, 
    permissions?: string[],
    rowId: string = ID.unique()
): Promise<T> {
    return await tablesDB.createRow<T>({
        databaseId: DATABASE_ID,
        tableId,
        rowId,
        data,
        permissions
    });
}

async function getRow<T extends Models.Row>(tableId: string, rowId: string): Promise<T> {
    return await tablesDB.getRow<T>({
        databaseId: DATABASE_ID,
        tableId,
        rowId
    });
}

async function updateRow<T extends Models.Row>(tableId: string, rowId: string, data: TableUpdateData<T>): Promise<T> {
    return await tablesDB.updateRow<T>({
        databaseId: DATABASE_ID,
        tableId,
        rowId,
        data
    });
}

async function deleteRow(tableId: string, rowId: string): Promise<void> {
    await tablesDB.deleteRow({
        databaseId: DATABASE_ID,
        tableId,
        rowId
    });
}

// --- Calendars ---

export const calendars = {
    list: (queries?: string[]) => listRows<Calendar>(TABLES.CALENDARS, queries),
    create: (data: TableCreateData<Calendar>) => createRow<Calendar>(TABLES.CALENDARS, data),
    get: (id: string) => getRow<Calendar>(TABLES.CALENDARS, id),
    update: (id: string, data: TableUpdateData<Calendar>) => updateRow<Calendar>(TABLES.CALENDARS, id, data),
    delete: (id: string) => deleteRow(TABLES.CALENDARS, id)
};

// --- Tasks ---

export const tasks = {
    list: (queries?: string[]) => listRows<Task>(TABLES.TASKS, queries),
    create: (data: TableCreateData<Task>) => createRow<Task>(TABLES.TASKS, data),
    get: (id: string) => getRow<Task>(TABLES.TASKS, id),
    update: (id: string, data: TableUpdateData<Task>) => updateRow<Task>(TABLES.TASKS, id, data),
    delete: (id: string) => deleteRow(TABLES.TASKS, id)
};

// --- Events ---

export const events = {
    list: (queries?: string[]) => listRows<Event>(TABLES.EVENTS, queries),
    create: (data: TableCreateData<Event>, permissions?: string[]) => 
        createRow<Event>(TABLES.EVENTS, data, permissions),
    get: (id: string) => getRow<Event>(TABLES.EVENTS, id),
    update: (id: string, data: TableUpdateData<Event>) => updateRow<Event>(TABLES.EVENTS, id, data),
    delete: (id: string) => deleteRow(TABLES.EVENTS, id)
};

// --- Event Guests ---

export const eventGuests = {
    list: (queries?: string[]) => listRows<EventGuest>(TABLES.EVENT_GUESTS, queries),
    create: (data: TableCreateData<EventGuest>) => createRow<EventGuest>(TABLES.EVENT_GUESTS, data),
    get: (id: string) => getRow<EventGuest>(TABLES.EVENT_GUESTS, id),
    update: (id: string, data: TableUpdateData<EventGuest>) => updateRow<EventGuest>(TABLES.EVENT_GUESTS, id, data),
    delete: (id: string) => deleteRow(TABLES.EVENT_GUESTS, id)
};

// --- Focus Sessions ---

export const focusSessions = {
    list: (queries?: string[]) => listRows<FocusSession>(TABLES.FOCUS_SESSIONS, queries),
    create: (data: TableCreateData<FocusSession>) => createRow<FocusSession>(TABLES.FOCUS_SESSIONS, data),
    get: (id: string) => getRow<FocusSession>(TABLES.FOCUS_SESSIONS, id),
    update: (id: string, data: TableUpdateData<FocusSession>) => updateRow<FocusSession>(TABLES.FOCUS_SESSIONS, id, data),
    delete: (id: string) => deleteRow(TABLES.FOCUS_SESSIONS, id)
};

// --- Notes ---

export const notes = {
    list: (queries?: string[]) => tablesDB.listRows({ 
        databaseId: APPWRITE_CONFIG.NOTE_DATABASE_ID, 
        tableId: TABLES.NOTES, 
        queries 
    }),
    get: (id: string) => tablesDB.getRow({
        databaseId: APPWRITE_CONFIG.NOTE_DATABASE_ID,
        tableId: TABLES.NOTES,
        rowId: id
    }),
    update: (id: string, data: any) => tablesDB.updateRow({
        databaseId: APPWRITE_CONFIG.NOTE_DATABASE_ID,
        tableId: TABLES.NOTES,
        rowId: id,
        data
    })
};

// --- Secrets (Keep) ---

export const secrets = {
    list: (queries?: string[]) => tablesDB.listRows({ 
        databaseId: 'passwordManagerDb', 
        tableId: 'credentials', 
        queries 
    }),
    get: (id: string) => tablesDB.getRow({
        databaseId: 'passwordManagerDb',
        tableId: 'credentials',
        rowId: id
    }),
    update: (id: string, data: any) => tablesDB.updateRow({
        databaseId: 'passwordManagerDb',
        tableId: 'credentials',
        rowId: id,
        data
    })
};
