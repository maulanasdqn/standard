import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Button } from "../button.tsx";

const LABEL = "Save";

describe("Button", () => {
	afterEach(cleanup);

	it("stays enabled and idle by default", (): void => {
		render(<Button>{LABEL}</Button>);

		const button = screen.getByRole("button", { name: LABEL });
		expect(button.hasAttribute("disabled")).toBe(false);
		expect(button.getAttribute("aria-busy")).toBeNull();
	});

	it("disables itself and shows a spinner while pending", (): void => {
		render(<Button pending>{LABEL}</Button>);

		const button = screen.getByRole("button", { name: LABEL });
		expect(button.hasAttribute("disabled")).toBe(true);
		expect(button.getAttribute("aria-busy")).toBe("true");
		expect(button.querySelector("[data-spinner]")).not.toBeNull();
	});

	it("renders a single slotted child when used as a link", (): void => {
		render(
			<Button asChild pending>
				<a href="/notes">{LABEL}</a>
			</Button>,
		);

		const link = screen.getByRole("link", { name: LABEL });
		expect(link.querySelector("[data-spinner]")).toBeNull();
	});
});
