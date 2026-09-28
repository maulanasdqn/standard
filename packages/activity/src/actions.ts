export const ACTIVITY_RESOURCE_TYPE = {
	NOTE: "note",
	NOTE_ATTACHMENT: "note_attachment",
	USER: "user",
	ROLE: "role",
	SESSION: "session",
} as const;

export type TActivityResourceType =
	(typeof ACTIVITY_RESOURCE_TYPE)[keyof typeof ACTIVITY_RESOURCE_TYPE];

export const ACTIVITY_ACTION = {
	NOTE_CREATE: "note.create",
	NOTE_UPDATE: "note.update",
	NOTE_DELETE: "note.delete",
	NOTE_ATTACHMENT_UPLOAD: "note_attachment.upload",
	NOTE_ATTACHMENT_DELETE: "note_attachment.delete",
	USER_CREATE: "user.create",
	USER_UPDATE: "user.update",
	USER_DELETE: "user.delete",
	USER_PASSWORD_RESET: "user.password_reset",
	ROLE_CREATE: "role.create",
	ROLE_UPDATE: "role.update",
	ROLE_DELETE: "role.delete",
	SESSION_CREATE: "session.create",
} as const;

export type TActivityAction =
	(typeof ACTIVITY_ACTION)[keyof typeof ACTIVITY_ACTION];
