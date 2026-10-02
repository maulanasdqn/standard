import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CollapsibleSection } from "../collapsible-section.tsx";

const TITLE = "Advanced";
const DESCRIPTION = "Settings most people leave alone";
const BODY = "Section body";

const EXPANDED = "aria-expanded";

describe("CollapsibleSection", () => {
	afterEach(cleanup);

	it("labels the section by its title", (): void => {
		render(
			<CollapsibleSection title={TITLE} description={DESCRIPTION}>
				<p>{BODY}</p>
			</CollapsibleSection>,
		);

		expect(screen.getByRole("region", { name: TITLE })).toBeTruthy();
		expect(screen.getByText(DESCRIPTION)).toBeTruthy();
	});

	it("starts collapsed and opens on the trigger", (): void => {
		render(
			<CollapsibleSection title={TITLE}>
				<p>{BODY}</p>
			</CollapsibleSection>,
		);

		const trigger = screen.getByRole("button");
		expect(trigger.getAttribute(EXPANDED)).toBe(String(false));
		expect(screen.queryByText(BODY)).toBeNull();

		fireEvent.click(trigger);

		expect(trigger.getAttribute(EXPANDED)).toBe(String(true));
		expect(screen.getByText(BODY)).toBeTruthy();
	});

	it("can start open and reports changes when controlled", (): void => {
		const onOpenChange = vi.fn();
		render(
			<CollapsibleSection title={TITLE} open onOpenChange={onOpenChange}>
				<p>{BODY}</p>
			</CollapsibleSection>,
		);

		expect(screen.getByText(BODY)).toBeTruthy();

		fireEvent.click(screen.getByRole("button"));

		expect(onOpenChange).toHaveBeenCalledWith(false);
	});
});
