import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StatusTabs, type TStatusTab } from "../status-tabs.tsx";

const STATUS = {
	ACTIVE: "active",
	BANNED: "banned",
	ALL: "all",
} as const;

type TStatus = (typeof STATUS)[keyof typeof STATUS];

const LIST_LABEL = "User status";

const TABS: readonly TStatusTab<TStatus>[] = [
	{ value: STATUS.ACTIVE, label: "Active", count: 12 },
	{ value: STATUS.BANNED, label: "Banned", count: 3 },
	{ value: STATUS.ALL, label: "All" },
];

const PRIMARY_BUTTON = 0;

describe("StatusTabs", () => {
	afterEach(cleanup);

	it("renders a tab per status with its count", (): void => {
		render(
			<StatusTabs
				tabs={TABS}
				value={STATUS.ACTIVE}
				label={LIST_LABEL}
				onChange={(): void => undefined}
			/>,
		);

		expect(screen.getByRole("tablist", { name: LIST_LABEL })).toBeTruthy();
		expect(screen.getByRole("tab", { name: "Active 12" })).toBeTruthy();
		expect(screen.getByRole("tab", { name: "Banned 3" })).toBeTruthy();
		expect(screen.getByRole("tab", { name: "All" })).toBeTruthy();
	});

	it("marks the controlled value as the selected tab", (): void => {
		render(
			<StatusTabs
				tabs={TABS}
				value={STATUS.BANNED}
				onChange={(): void => undefined}
			/>,
		);

		expect(
			screen
				.getByRole("tab", { name: "Banned 3" })
				.getAttribute("aria-selected"),
		).toBe(String(true));
	});

	it("reports the chosen status without switching on its own", (): void => {
		const onChange = vi.fn();
		render(
			<StatusTabs tabs={TABS} value={STATUS.ACTIVE} onChange={onChange} />,
		);

		fireEvent.mouseDown(screen.getByRole("tab", { name: "Banned 3" }), {
			button: PRIMARY_BUTTON,
		});

		expect(onChange).toHaveBeenCalledWith(STATUS.BANNED);
		expect(
			screen
				.getByRole("tab", { name: "Active 12" })
				.getAttribute("aria-selected"),
		).toBe(String(true));
	});
});
