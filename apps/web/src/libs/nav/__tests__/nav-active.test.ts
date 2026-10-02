import { A } from "@mobily/ts-belt";
import { describe, expect, it } from "vitest";
import { navActiveTarget } from "#/libs/nav/nav-active.ts";

const TARGETS = ["/dashboard", "/signal", "/signal/rules", "/users"] as const;

const prefixOf =
	(path: string): ((target: string) => boolean) =>
	(target: string): boolean =>
		path === target || path.startsWith(`${target}/`);

describe("navActiveTarget", () => {
	it("picks the deepest entry when a parent and a child both match", (): void => {
		expect(navActiveTarget(TARGETS, prefixOf("/signal/rules/42"))).toBe(
			"/signal/rules",
		);
	});

	it("keeps the parent when only the parent matches", (): void => {
		expect(navActiveTarget(TARGETS, prefixOf("/signal/7"))).toBe("/signal");
	});

	it("returns nothing when no entry matches", (): void => {
		expect(navActiveTarget(TARGETS, prefixOf("/account"))).toBeUndefined();
	});

	it("does not reorder the entries it was given", (): void => {
		const targets = [...TARGETS];
		navActiveTarget(targets, prefixOf("/signal/rules"));
		expect(targets).toEqual(A.map(TARGETS, (target): string => target));
	});
});
