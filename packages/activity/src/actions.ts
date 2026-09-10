export const ACTIVITY_ENTITY_TYPE = {
	NOTE: "note",
	USER: "user",
	ROLE: "role",
	SESSION: "session",
} as const;

export type TActivityEntityType =
	(typeof ACTIVITY_ENTITY_TYPE)[keyof typeof ACTIVITY_ENTITY_TYPE];

export const ACTIVITY_ACTION = {
	NOTE_CREATE: "note.create",
	NOTE_UPDATE: "note.update",
	NOTE_DELETE: "note.delete",
	USER_CREATE: "user.create",
	USER_UPDATE: "user.update",
	USER_DELETE: "user.delete",
	ROLE_CREATE: "role.create",
	ROLE_UPDATE: "role.update",
	ROLE_DELETE: "role.delete",
	SESSION_CREATE: "session.create",
} as const;

export type TActivityAction =
	(typeof ACTIVITY_ACTION)[keyof typeof ACTIVITY_ACTION];
