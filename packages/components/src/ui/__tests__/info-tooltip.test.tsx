import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { UI_MESSAGE } from "../../lib/messages.ts";
import { InfoTooltip } from "../info-tooltip.tsx";

const CONTENT = "Used to sign in";
const CUSTOM_LABEL = "About the email";

class ResizeObserverStub {
	observe = (): void => undefined;
	unobserve = (): void => undefined;
	disconnect = (): void => undefined;
}

describe("InfoTooltip", () => {
	beforeAll((): void => {
		vi.stubGlobal("ResizeObserver", ResizeObserverStub);
	});

	afterEach(cleanup);

	it("names the button from the package messages", (): void => {
		render(<InfoTooltip content={CONTENT} />);

		const button = screen.getByRole("button", { name: UI_MESSAGE.MORE_INFO });
		expect(button.getAttribute("type")).toBe("button");
	});

	it("accepts a more specific accessible label", (): void => {
		render(<InfoTooltip content={CONTENT} label={CUSTOM_LABEL} />);

		expect(screen.getByRole("button", { name: CUSTOM_LABEL })).toBeTruthy();
	});

	it("reveals the tooltip once the button takes focus", (): void => {
		render(<InfoTooltip content={CONTENT} />);
		expect(screen.queryByRole("tooltip")).toBeNull();

		fireEvent.focus(screen.getByRole("button", { name: UI_MESSAGE.MORE_INFO }));

		expect(screen.getByRole("tooltip").textContent).toBe(CONTENT);
	});
});
