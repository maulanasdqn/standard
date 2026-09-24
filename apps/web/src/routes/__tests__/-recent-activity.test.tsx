import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { ACTIVITY_ACTION_LABEL, ACTIVITY_ENTITY_LABEL } from "@app/messages";
import { cleanup, render, screen } from "@testing-library/react";
import type { PropsWithChildren, ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RecentActivity } from "#/routes/_authenticated/dashboard/_components/recent-activity.tsx";

vi.mock("@tanstack/react-router", () => ({
	Link: (props: PropsWithChildren): ReactElement => (
		<span>{props.children}</span>
	),
}));

const ENTRY = {
	id: "entry-1",
	createdAt: new Date().toISOString(),
	actorId: "user-1",
	actorEmail: "admin@test.app",
	action: ACTIVITY_ACTION.NOTE_CREATE,
	resourceType: ACTIVITY_RESOURCE_TYPE.NOTE,
	resourceId: "note-1",
	metadata: null,
};

describe("RecentActivity", () => {
	afterEach(cleanup);

	it("names the action once, in words rather than as a key", (): void => {
		render(<RecentActivity entries={[ENTRY]} />);

		expect(
			screen.getAllByText(ACTIVITY_ACTION_LABEL[ACTIVITY_ACTION.NOTE_CREATE]),
		).toHaveLength(1);
		expect(screen.queryByText(ACTIVITY_ACTION.NOTE_CREATE)).toBeNull();
	});

	it("names the entity in words", (): void => {
		render(<RecentActivity entries={[ENTRY]} />);

		expect(
			screen.getByText(ACTIVITY_ENTITY_LABEL[ACTIVITY_RESOURCE_TYPE.NOTE]),
		).toBeInTheDocument();
	});
});
