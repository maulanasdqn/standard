import { API_BASE_PATH, apiPathOf, ROUTE_PATH } from "@app/contract";

const OPENAPI_PREFIX = API_BASE_PATH;
const RPC_PREFIX = "/rpc";
const NOTES_RESOURCE = "/notes";
const NEWSLETTER_SUBSCRIBE_PROCEDURE = "/newsletter/subscribe";

export const ROUTE_PREFIX = {
	RPC: RPC_PREFIX,
	OPENAPI: OPENAPI_PREFIX,
	AUTH: `${OPENAPI_PREFIX}/auth`,
} as const;

export const UPLOAD_ROUTE = {
	NOTE_ATTACHMENT_RPC: `${RPC_PREFIX}/note/attachment/upload`,
	NOTE_ATTACHMENT_OPENAPI: `${OPENAPI_PREFIX}${NOTES_RESOURCE}/:noteId/attachments`,
} as const;

export const NEWSLETTER_SUBSCRIBE_ROUTE = {
	RPC: `${RPC_PREFIX}${NEWSLETTER_SUBSCRIBE_PROCEDURE}`,
	OPENAPI: apiPathOf(ROUTE_PATH.NEWSLETTER_SUBSCRIPTIONS),
} as const;
