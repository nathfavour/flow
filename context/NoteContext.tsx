'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import { ID } from 'appwrite';
import { notes as noteApi } from '@/lib/whisperrflow';
import { account } from '@/lib/appwrite';
import { APPWRITE_CONFIG } from '@/lib/config';
import { Note, NotesStatus } from '@/types/notes';

// State
interface NoteState {
  notes: Note[];
  selectedNoteId: string | null;
  isLoading: boolean;
  error: string | null;
  noteDialogOpen: boolean;
  userId: string | null;
}

const initialState: NoteState = {
  notes: [],
  selectedNoteId: null,
  isLoading: true,
  error: null,
  noteDialogOpen: false,
  userId: null,
};

// Actions
type NoteAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTES'; payload: Note[] }
  | { type: 'SET_USER'; payload: string }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: { id: string; updates: Partial<Note> } }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'SELECT_NOTE'; payload: string | null }
  | { type: 'SET_NOTE_DIALOG_OPEN'; payload: boolean };

// Reducer
function noteReducer(state: NoteState, action: NoteAction): NoteState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_NOTES':
      return { ...state, notes: action.payload, isLoading: false };

    case 'SET_USER':
      return { ...state, userId: action.payload };

    case 'ADD_NOTE':
      return { ...state, notes: [action.payload, ...state.notes] };

    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(note =>
          note.id === action.payload.id
            ? { ...note, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : note
        ),
      };

    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(note => note.id !== action.payload),
        selectedNoteId: state.selectedNoteId === action.payload ? null : state.selectedNoteId,
      };

    case 'SELECT_NOTE':
      return { ...state, selectedNoteId: action.payload };

    case 'SET_NOTE_DIALOG_OPEN':
      return { ...state, noteDialogOpen: action.payload };

    default:
      return state;
  }
}

// Context
interface NoteContextType extends NoteState {
  addNote: (note: { title: string; content: string; tags?: string[] }) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  selectNote: (id: string | null) => void;
  setNoteDialogOpen: (open: boolean) => void;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const useNote = () => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error('useNote must be used within a NoteProvider');
  }
  return context;
};

// Provider
interface NoteProviderProps {
  children: ReactNode;
}

export function NoteProvider({ children }: NoteProviderProps) {
  const [state, dispatch] = useReducer(noteReducer, initialState);
  const notesTableConfigured = Boolean(APPWRITE_CONFIG.TABLES.NOTES);

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Get current user
        let userId = 'guest';
        try {
          const user = await account.get();
          userId = user.$id;
          dispatch({ type: 'SET_USER', payload: userId });
        } catch (e) {
          console.warn('Not logged in', e);
        }

        if (!notesTableConfigured) {
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }

        // Fetch notes
        const notesList = await noteApi.list();
        // Assuming the response structure matches Note[] or needs mapping
        // casting for now as the types might need adjustment based on exact return of listRows
        const notes = notesList.rows as unknown as Note[];

        dispatch({ type: 'SET_NOTES', payload: notes });
      } catch (error) {
        console.error('Failed to fetch notes', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load notes' });
      }
    };

    fetchData();
  }, []);

  const addNote = useCallback(
    async (noteData: { title: string; content: string; tags?: string[] }) => {
      try {
        if (!notesTableConfigured) {
          console.warn('Notes table is not configured.');
          return;
        }
        const userId = state.userId || 'guest';
        const newNote = await noteApi.create({
          title: noteData.title,
          content: noteData.content,
          tags: noteData.tags || [],
          userId,
          status: NotesStatus.PUBLISHED,
          isPublic: false,
          parentNoteId: null,
          id: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          comments: [],
          extensions: [],
          collaborators: [],
          metadata: null,
          attachments: null,
          format: null,
        });

        dispatch({ type: 'ADD_NOTE', payload: newNote as unknown as Note });
      } catch (error) {
        console.error('Failed to create note', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to create note' });
      }
    },
    [state.userId]
  );

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    try {
      if (!notesTableConfigured) {
        console.warn('Notes table is not configured.');
        return;
      }
      dispatch({ type: 'UPDATE_NOTE', payload: { id, updates } });
      
      // Filter out fields that shouldn't be sent to update
      const { id: _, $id, $createdAt, $updatedAt, ...apiUpdates } = updates as any;
      
      await noteApi.update(id, apiUpdates);
    } catch (error) {
      console.error('Failed to update note', error);
    }
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    try {
      if (!notesTableConfigured) {
        console.warn('Notes table is not configured.');
        return;
      }
      await noteApi.delete(id);
      dispatch({ type: 'DELETE_NOTE', payload: id });
    } catch (error) {
      console.error('Failed to delete note', error);
    }
  }, []);

  const selectNote = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_NOTE', payload: id });
  }, []);

  const setNoteDialogOpen = useCallback((open: boolean) => {
    dispatch({ type: 'SET_NOTE_DIALOG_OPEN', payload: open });
  }, []);

  const value: NoteContextType = {
    ...state,
    addNote,
    updateNote,
    deleteNote,
    selectNote,
    setNoteDialogOpen,
  };

  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;
}

