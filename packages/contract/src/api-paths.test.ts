import { describe, expect, it } from "vitest";
import { API_BASE_PATH, apiPathOf } from "./api-paths.ts";
import { ROUTE_PATH } from "./route-paths.ts";

describe("apiPathOf", () => {
	it("places a contract route under the prefix the REST surface is served from", (): void => {
		expect(apiPathOf(ROUTE_PATH.NEWSLETTER_SUBSCRIPTIONS)).toBe(
			`${API_BASE_PATH}/newsletter/subscriptions`,
		);
	});
});
