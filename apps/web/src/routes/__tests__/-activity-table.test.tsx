import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ActivityTable } from "#/routes/_authenticated/activity/_components/activity-table.tsx";

describe("ActivityTable", () => {
	it("renders an empty state when there are no entries", (): void => {
		render(<ActivityTable entries={[]} />);
		expect(screen.getByText("No activity yet.")).toBeInTheDocument();
	});
});
