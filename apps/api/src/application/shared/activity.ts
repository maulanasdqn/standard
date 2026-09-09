export const ACTIVITY_ENTITY_TYPE = {
	NOTE: "note",
	SESSION: "session",
} as const;

export const ACTIVITY_ACTION = {
	NOTE_CREATE: "note.create",
	NOTE_UPDATE: "note.update",
	NOTE_DELETE: "note.delete",
	SESSION_CREATE: "session.create",
} as const;
