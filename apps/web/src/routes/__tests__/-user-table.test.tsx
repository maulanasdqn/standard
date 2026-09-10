import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderResult, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { UserTable } from "#/routes/_authenticated/users/_components/user-table.tsx";

const renderWithClient = (ui: ReactElement): RenderResult => {
	const queryClient = new QueryClient();
	return render(
		<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
	);
};

describe("UserTable", () => {
	it("renders an empty state when there are no users", (): void => {
		renderWithClient(<UserTable users={[]} roleOptions={[]} />);
		expect(screen.getByText("No users yet.")).toBeInTheDocument();
	});
});
