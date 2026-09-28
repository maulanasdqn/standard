const OPENAPI_PREFIX = "/api";
const RPC_PREFIX = "/rpc";
const NOTES_RESOURCE = "/notes";

export const ROUTE_PREFIX = {
	RPC: RPC_PREFIX,
	OPENAPI: OPENAPI_PREFIX,
	AUTH: `${OPENAPI_PREFIX}/auth`,
} as const;

export const UPLOAD_ROUTE = {
	NOTE_ATTACHMENT_RPC: `${RPC_PREFIX}/note/attachment/upload`,
	NOTE_ATTACHMENT_OPENAPI: `${OPENAPI_PREFIX}${NOTES_RESOURCE}/:noteId/attachments`,
} as const;
