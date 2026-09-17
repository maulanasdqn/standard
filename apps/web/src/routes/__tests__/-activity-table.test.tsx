import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ACTIVITY_SORT, SORT_DIRECTION } from "@app/schemas";
import { ActivityTable } from "#/routes/_authenticated/activity/_components/activity-table.tsx";

describe("ActivityTable", () => {
	it("renders an empty state when there are no entries", (): void => {
		render(
			<ActivityTable
				list={{ items: [], total: 0, page: 1, pageSize: 20 }}
				sortBy={ACTIVITY_SORT.CREATED_AT}
				sortDir={SORT_DIRECTION.DESC}
				onChange={() => undefined}
			/>,
		);
		expect(screen.getByText("No activity yet.")).toBeInTheDocument();
	});
});
