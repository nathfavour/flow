export const NOTE_SOURCE_TAG_PREFIX = 'source:kylrixnote';

const uniqueStrings = (values: Array<string | null | undefined>) =>
  Array.from(new Set(values.map((value) => String(value || '').trim()).filter(Boolean)));

const normalizeNoteId = (noteId: string) => String(noteId || '').trim();

export function buildSourceNoteTags(noteIds: Array<string | null | undefined>) {
  return uniqueStrings(noteIds).map((noteId) => `${NOTE_SOURCE_TAG_PREFIX}:${normalizeNoteId(noteId)}`);
}
