import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CountUp } from "../count-up.tsx";

const TARGET = 42;
const LABEL = "count";

describe("CountUp", () => {
	afterEach(cleanup);

	it("counts from zero up to the value", async (): Promise<void> => {
		render(<CountUp value={TARGET} className={LABEL} />);

		await waitFor(
			(): void => {
				expect(screen.getByText(String(TARGET))).toBeTruthy();
			},
			{ timeout: 3000 },
		);
	});

	it("counts on to a new value without remounting", async (): Promise<void> => {
		const view = render(<CountUp value={TARGET} />);
		view.rerender(<CountUp value={TARGET * 2} />);

		await waitFor(
			(): void => {
				expect(screen.getByText(String(TARGET * 2))).toBeTruthy();
			},
			{ timeout: 3000 },
		);
	});
});
