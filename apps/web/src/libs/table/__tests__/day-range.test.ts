import { describe, expect, it } from "vitest";
import { dayRangeToInstants } from "#/libs/table/day-range.ts";

describe("dayRangeToInstants", () => {
	it("spans the whole local day on both ends", (): void => {
		const range = dayRangeToInstants({
			dateFrom: "2026-09-01",
			dateTo: "2026-09-30",
		});

		expect(range.dateFrom).toBe(new Date(2026, 8, 1).toISOString());
		expect(range.dateTo).toBe(
			new Date(2026, 8, 30, 23, 59, 59, 999).toISOString(),
		);
	});

	it("leaves an open end open", (): void => {
		expect(dayRangeToInstants({ dateFrom: "2026-09-01" }).dateTo).toBe(
			undefined,
		);
		expect(dayRangeToInstants({}).dateFrom).toBe(undefined);
	});
});
