import { describe, expect, it } from "vitest";
import {
	OPENAPI_MOUNT_ROUTE,
	restRouteLabel,
} from "#/platform/http/rest-route-label.ts";

const NOTE_ID = "018f2c4e-1a2b-7c3d-9e4f-5a6b7c8d9e0f";
const SESSION_ID = "b0c1d2e3-f4a5-4b6c-8d7e-9f0a1b2c3d4e";
const AUTH_ROUTE = "/api/auth/*";
const RPC_ROUTE = "/rpc/*";

describe("restRouteLabel", () => {
	it("labels a call by its contract template, without the resource id", (): void => {
		expect(restRouteLabel(OPENAPI_MOUNT_ROUTE, `/api/notes/${NOTE_ID}`)).toBe(
			"/api/notes/{id}",
		);
	});

	it("labels a collection call by its own path", (): void => {
		expect(restRouteLabel(OPENAPI_MOUNT_ROUTE, "/api/notes")).toBe(
			"/api/notes",
		);
	});

	it("matches a template with two parameters", (): void => {
		expect(
			restRouteLabel(
				OPENAPI_MOUNT_ROUTE,
				`/api/users/${NOTE_ID}/sessions/${SESSION_ID}`,
			),
		).toBe("/api/users/{id}/sessions/{sessionId}");
	});

	it("prefers a literal route over a parameter route that also matches", (): void => {
		expect(restRouteLabel(OPENAPI_MOUNT_ROUTE, "/api/users/invite")).toBe(
			"/api/users/invite",
		);
	});

	it("keeps the mount wildcard for a path that matches no template", (): void => {
		expect(
			restRouteLabel(OPENAPI_MOUNT_ROUTE, "/api/nothing/here/at/all"),
		).toBe(OPENAPI_MOUNT_ROUTE);
	});

	it("leaves the auth mount and the rpc mount untouched", (): void => {
		expect(restRouteLabel(AUTH_ROUTE, "/api/auth/sign-in/email")).toBe(
			AUTH_ROUTE,
		);
		expect(restRouteLabel(RPC_ROUTE, "/rpc/note/list")).toBe(RPC_ROUTE);
	});
});
