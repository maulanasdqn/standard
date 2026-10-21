import { formatDateTime } from "@app/format";
import { NEWSLETTER_MESSAGE } from "@app/messages";
import {
	NEWSLETTER_SORT,
	NEWSLETTER_SOURCE,
	NEWSLETTER_STATUS,
	SORT_DIRECTION,
	type TNewsletterSubscriber,
} from "@app/schemas";
import { render, type RenderResult, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import type { TSearchControl } from "#/libs/forms/use-search-form.ts";
import type { TSearchBoxProps } from "#/routes/_authenticated/_components/search-box.tsx";
import { describe, expect, it, vi } from "vitest";
import { SubscriberTable } from "#/routes/_authenticated/subscribers/_components/subscriber-table.tsx";

const ACTIONS_LABEL = "subscriber actions";
const CREATED_AT = "2026-01-02T03:04:00.000Z";

vi.mock(
	"#/routes/_authenticated/subscribers/_hooks/use-subscribers.ts",
	async (importOriginal) => ({
		...(await importOriginal<Record<string, unknown>>()),
		useSubscriberSearch: (): TSearchControl => ({
			value: "",
			onChange: vi.fn(),
		}),
	}),
);

vi.mock("#/routes/_authenticated/_components/search-box.tsx", () => ({
	SearchBox: (props: TSearchBoxProps): ReactElement => (
		<input aria-label={props.label} />
	),
}));

vi.mock(
	"#/routes/_authenticated/subscribers/_components/subscriber-actions-cell.tsx",
	() => ({
		SubscriberActionsCell: (): ReactElement => <span>{ACTIONS_LABEL}</span>,
	}),
);

const subscribers: readonly TNewsletterSubscriber[] = [
	{
		id: "11111111-1111-4111-8111-111111111111",
		email: "first@example.com",
		status: NEWSLETTER_STATUS.PENDING,
		source: NEWSLETTER_SOURCE.LANDING,
		createdAt: CREATED_AT,
		updatedAt: CREATED_AT,
	},
	{
		id: "33333333-3333-4333-8333-333333333333",
		email: "second@example.com",
		status: NEWSLETTER_STATUS.CONFIRMED,
		source: NEWSLETTER_SOURCE.BLOG,
		createdAt: CREATED_AT,
		updatedAt: CREATED_AT,
	},
];

const renderRows = (items: readonly TNewsletterSubscriber[]): RenderResult =>
	render(
		<SubscriberTable
			list={{ items, total: items.length, page: 1, pageSize: 20 }}
			sortBy={NEWSLETTER_SORT.CREATED_AT}
			sortDir={SORT_DIRECTION.DESC}
			onChange={() => undefined}
		/>,
	);

describe("SubscriberTable", () => {
	it("renders one row per subscriber with its address", (): void => {
		renderRows(subscribers);

		expect(
			screen.getByRole("row", { name: /first@example\.com/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("row", { name: /second@example\.com/i }),
		).toBeInTheDocument();
	});

	it("names the status and the source in words", (): void => {
		renderRows(subscribers);

		expect(
			screen.getByText(NEWSLETTER_MESSAGE.STATUS_PENDING),
		).toBeInTheDocument();
		expect(
			screen.getByText(NEWSLETTER_MESSAGE.STATUS_CONFIRMED),
		).toBeInTheDocument();
		expect(
			screen.getByText(NEWSLETTER_MESSAGE.SOURCE_LANDING),
		).toBeInTheDocument();
		expect(
			screen.getByText(NEWSLETTER_MESSAGE.SOURCE_BLOG),
		).toBeInTheDocument();
	});

	it("formats the sign-up time and gives every row its actions", (): void => {
		renderRows(subscribers);

		expect(screen.getAllByText(formatDateTime(CREATED_AT))).toHaveLength(
			subscribers.length,
		);
		expect(screen.getAllByText(ACTIONS_LABEL)).toHaveLength(subscribers.length);
	});

	it("says so when nobody has signed up", (): void => {
		renderRows([]);

		expect(screen.getByText(NEWSLETTER_MESSAGE.EMPTY)).toBeInTheDocument();
	});
});
