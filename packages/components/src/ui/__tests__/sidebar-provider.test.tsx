import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import type { FC, ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	SIDEBAR_KEYBOARD_SHORTCUT,
	SIDEBAR_STATE,
	useSidebar,
} from "../sidebar-context.ts";
import { SidebarProvider } from "../sidebar-provider.tsx";
import { sidebarStore } from "../sidebar-store.ts";

vi.hoisted((): void => {
	window.matchMedia = vi.fn().mockReturnValue({
		matches: false,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
	});
});

const SHORTCUT = { key: SIDEBAR_KEYBOARD_SHORTCUT, ctrlKey: true };

const SidebarState: FC = (): ReactElement => <p>{useSidebar().state}</p>;

const toggleByShortcut = (): void => {
	act((): void => {
		fireEvent.keyDown(window, SHORTCUT);
	});
};

describe("SidebarProvider", () => {
	beforeEach((): void => {
		sidebarStore.setState((state) => ({ ...state, open: undefined }));
	});

	afterEach(cleanup);

	it("starts expanded unless told otherwise", (): void => {
		render(
			<SidebarProvider>
				<SidebarState />
			</SidebarProvider>,
		);

		expect(screen.getByText(SIDEBAR_STATE.EXPANDED)).toBeTruthy();
	});

	it("starts collapsed when defaultOpen is false", (): void => {
		render(
			<SidebarProvider defaultOpen={false}>
				<SidebarState />
			</SidebarProvider>,
		);

		expect(screen.getByText(SIDEBAR_STATE.COLLAPSED)).toBeTruthy();
	});

	it("toggles on the keyboard shortcut, both ways", (): void => {
		render(
			<SidebarProvider>
				<SidebarState />
			</SidebarProvider>,
		);

		toggleByShortcut();
		expect(screen.getByText(SIDEBAR_STATE.COLLAPSED)).toBeTruthy();
		toggleByShortcut();
		expect(screen.getByText(SIDEBAR_STATE.EXPANDED)).toBeTruthy();
	});

	it("stops listening for the shortcut once unmounted", (): void => {
		const view = render(
			<SidebarProvider>
				<SidebarState />
			</SidebarProvider>,
		);

		view.unmount();
		toggleByShortcut();

		expect(sidebarStore.state.open).toBeUndefined();
	});
});
