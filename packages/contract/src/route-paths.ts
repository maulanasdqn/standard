const RESOURCE = {
	NOTES: "/notes",
	NOTE_ATTACHMENTS: "/note-attachments",
	USERS: "/users",
	ROLES: "/roles",
} as const;

export const ROUTE_PATH = {
	HEALTH: "/health",
	HEALTHZ: "/healthz",
	READY: "/ready",
	METRICS: "/metrics",
	ME: "/me",
	PERMISSIONS: "/permissions",
	ACTIVITY: "/activity",
	NOTES: RESOURCE.NOTES,
	NOTE: `${RESOURCE.NOTES}/{id}`,
	NOTE_ATTACHMENTS: `${RESOURCE.NOTES}/{noteId}/attachments`,
	NOTE_ATTACHMENT: `${RESOURCE.NOTE_ATTACHMENTS}/{id}`,
	USERS: RESOURCE.USERS,
	USER: `${RESOURCE.USERS}/{id}`,
	USER_PASSWORD: `${RESOURCE.USERS}/{id}/password`,
	USER_INVITE: `${RESOURCE.USERS}/invite`,
	USER_DEACTIVATE: `${RESOURCE.USERS}/{id}/deactivate`,
	USER_REACTIVATE: `${RESOURCE.USERS}/{id}/reactivate`,
	USER_SESSIONS: `${RESOURCE.USERS}/{id}/sessions`,
	USER_SESSION: `${RESOURCE.USERS}/{id}/sessions/{sessionId}`,
	ROLES: RESOURCE.ROLES,
	ROLE: `${RESOURCE.ROLES}/{key}`,
} as const;
export type TRoutePath = (typeof ROUTE_PATH)[keyof typeof ROUTE_PATH];
