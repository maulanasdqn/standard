import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { formatDateTime, NOT_SET } from "@app/format";
import { ACTIVITY_ACTION_LABEL, ACTIVITY_ENTITY_LABEL } from "@app/messages";
import { ACTIVITY_SORT, SORT_DIRECTION, type TActivity } from "@app/schemas";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { ActivityTable } from "#/routes/_authenticated/activity/_components/activity-table.tsx";

const CREATED_AT = "2026-01-02T03:04:00.000Z";
const ACTOR_EMAIL = "admin@test.app";
const NOTE_ID = "note-1";

vi.mock(
	"#/routes/_authenticated/activity/_components/activity-filters.tsx",
	() => ({
		ActivityFilters: (): ReactElement => (
			<fieldset aria-label="Activity filters" />
		),
	}),
);

const entries: readonly TActivity[] = [
	{
		id: "11111111-1111-4111-8111-111111111111",
		actorId: "22222222-2222-4222-8222-222222222222",
		actorEmail: ACTOR_EMAIL,
		action: ACTIVITY_ACTION.NOTE_CREATE,
		resourceType: ACTIVITY_RESOURCE_TYPE.NOTE,
		resourceId: NOTE_ID,
		metadata: null,
		createdAt: CREATED_AT,
	},
	{
		id: "33333333-3333-4333-8333-333333333333",
		actorId: null,
		actorEmail: null,
		action: ACTIVITY_ACTION.USER_UPDATE,
		resourceType: ACTIVITY_RESOURCE_TYPE.USER,
		resourceId: "user-1",
		metadata: { role: "member" },
		createdAt: CREATED_AT,
	},
];

const renderRows = (): void => {
	render(
		<ActivityTable
			list={{ items: entries, total: entries.length, page: 1, pageSize: 20 }}
			sortBy={ACTIVITY_SORT.CREATED_AT}
			sortDir={SORT_DIRECTION.DESC}
			onChange={() => undefined}
		/>,
	);
};

describe("ActivityTable with rows", () => {
	it("renders the actor, the action label and the entity of each entry", (): void => {
		renderRows();

		const first = screen.getByRole("row", { name: new RegExp(ACTOR_EMAIL) });
		expect(first).toHaveTextContent(
			ACTIVITY_ACTION_LABEL[ACTIVITY_ACTION.NOTE_CREATE],
		);
		expect(first).toHaveTextContent(
			ACTIVITY_ENTITY_LABEL[ACTIVITY_RESOURCE_TYPE.NOTE],
		);
		expect(first).toHaveTextContent(NOTE_ID);
		expect(screen.queryByText("No activity yet.")).not.toBeInTheDocument();
	});

	it("shows a dash when the actor is gone and when there are no details", (): void => {
		renderRows();

		const first = screen.getByRole("row", { name: new RegExp(ACTOR_EMAIL) });
		const second = screen.getByRole("row", {
			name: new RegExp(ACTIVITY_ACTION_LABEL[ACTIVITY_ACTION.USER_UPDATE]),
		});
		expect(first).toHaveTextContent(NOT_SET);
		expect(second).toHaveTextContent(NOT_SET);
	});

	it("spells the metadata out as key and value pairs", (): void => {
		renderRows();

		expect(screen.getByText("role: member")).toBeVisible();
	});

	it("formats the time of each entry", (): void => {
		renderRows();

		expect(screen.getAllByText(formatDateTime(CREATED_AT))).toHaveLength(
			entries.length,
		);
	});
});
