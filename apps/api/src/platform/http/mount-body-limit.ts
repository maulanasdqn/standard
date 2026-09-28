import { NOTE_ATTACHMENT_MAX_BYTES } from "@app/schemas";
import type { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { except } from "hono/combine";
import { UPLOAD_ROUTE } from "#/platform/http/route-paths.ts";

export const REQUEST_BODY_MAX_BYTES = 1_048_576;
export const MULTIPART_OVERHEAD_BYTES = 65_536;
export const UPLOAD_BODY_MAX_BYTES =
	NOTE_ATTACHMENT_MAX_BYTES + MULTIPART_OVERHEAD_BYTES;

const UPLOAD_ROUTES = [
	UPLOAD_ROUTE.NOTE_ATTACHMENT_RPC,
	UPLOAD_ROUTE.NOTE_ATTACHMENT_OPENAPI,
];

export const bodyLimitMount = (app: Hono): void => {
	app.use(
		"*",
		except(UPLOAD_ROUTES, bodyLimit({ maxSize: REQUEST_BODY_MAX_BYTES })),
	);
	app.use(
		UPLOAD_ROUTE.NOTE_ATTACHMENT_RPC,
		bodyLimit({ maxSize: UPLOAD_BODY_MAX_BYTES }),
	);
	app.use(
		UPLOAD_ROUTE.NOTE_ATTACHMENT_OPENAPI,
		bodyLimit({ maxSize: UPLOAD_BODY_MAX_BYTES }),
	);
};
