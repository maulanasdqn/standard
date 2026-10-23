import { describe, expect, it } from "vitest";
import {
	RPC_MOUNT_ROUTE,
	rpcRouteLabel,
} from "#/platform/http/rpc-route-label.ts";

const NOTE_LIST = "/rpc/note/list";
const ATTACHMENT_UPLOAD = "/rpc/note/attachment/upload";
const OPENAPI_ROUTE = "/api/*";

describe("rpcRouteLabel", () => {
	it("labels a known procedure by its own path", (): void => {
		expect(rpcRouteLabel(RPC_MOUNT_ROUTE, NOTE_LIST)).toBe(NOTE_LIST);
	});

	it("labels a nested procedure by its full path", (): void => {
		expect(rpcRouteLabel(RPC_MOUNT_ROUTE, ATTACHMENT_UPLOAD)).toBe(
			ATTACHMENT_UPLOAD,
		);
	});

	it("keeps the mount wildcard for a path that is not a procedure", (): void => {
		expect(rpcRouteLabel(RPC_MOUNT_ROUTE, "/rpc/note/anything-else")).toBe(
			RPC_MOUNT_ROUTE,
		);
	});

	it("leaves a route outside the rpc mount untouched", (): void => {
		expect(rpcRouteLabel(OPENAPI_ROUTE, NOTE_LIST)).toBe(OPENAPI_ROUTE);
	});
});
