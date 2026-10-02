import { SORT_DIRECTION } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import {
	type ColumnVisibilityState,
	createColumnHelper,
	type ReactTable,
} from "@tanstack/react-table";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { TTableFeatures } from "#/libs/table/features.ts";
import { useServerTable } from "#/routes/_authenticated/_hooks/use-server-table.ts";

type TRow = { id: string; title: string; body: string };

const COLUMN = { TITLE: "title", BODY: "body" } as const;
const ROWS: readonly TRow[] = [{ id: "1", title: "First", body: "Text" }];

const helper = createColumnHelper<TTableFeatures, TRow>();

const columns = helper.columns([
	helper.accessor(COLUMN.TITLE, { header: "Title" }),
	helper.accessor(COLUMN.BODY, { header: "Body" }),
]);

const renderTable = (
	initialColumnVisibility?: ColumnVisibilityState,
): { current: ReactTable<TTableFeatures, TRow> } =>
	renderHook(() =>
		useServerTable({
			columns,
			data: ROWS,
			getRowId: (row: TRow): string => row.id,
			total: ROWS.length,
			page: 1,
			pageSize: 20,
			sortBy: COLUMN.TITLE,
			sortDir: SORT_DIRECTION.ASC,
			sortKeys: [COLUMN.TITLE],
			onChange: (): void => undefined,
			initialColumnVisibility,
		}),
	).result;

const visibleIds = (table: ReactTable<TTableFeatures, TRow>): string[] => [
	...A.map(table.getVisibleLeafColumns(), (column) => column.id),
];

describe("useServerTable", () => {
	it("shows every column when no initial visibility is given", (): void => {
		const result = renderTable();

		expect(visibleIds(result.current)).toEqual([COLUMN.TITLE, COLUMN.BODY]);
	});

	it("starts with the columns the page asked to hide hidden", (): void => {
		const result = renderTable({ [COLUMN.BODY]: false });

		expect(visibleIds(result.current)).toEqual([COLUMN.TITLE]);
	});

	it("still lets the columns menu bring a hidden column back", (): void => {
		const result = renderTable({ [COLUMN.BODY]: false });

		act((): void => {
			result.current.getColumn(COLUMN.BODY)?.toggleVisibility(true);
		});

		expect(visibleIds(result.current)).toEqual([COLUMN.TITLE, COLUMN.BODY]);
	});
});
