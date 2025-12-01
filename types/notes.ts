export enum NotesStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface Note {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: unknown[];
  id: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  userId: string | null;
  isPublic: boolean | null;
  status: NotesStatus | null;
  parentNoteId: string | null;
  title: string | null;
  content: string | null;
  tags: string[] | null;
  comments: string[] | null;
  extensions: string[] | null;
  collaborators: string[] | null;
  metadata: string | null;
  attachments: string | null;
  format: string | null;
}

