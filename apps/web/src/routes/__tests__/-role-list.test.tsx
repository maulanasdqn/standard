import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderResult, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { RoleList } from "#/routes/_authenticated/roles/_components/role-list.tsx";

vi.mock("#/routes/_authenticated/roles/_components/role-filters.tsx", () => ({
	RoleFilters: (): ReactElement => <button type="button">Filters</button>,
}));

const renderWithClient = (ui: ReactElement): RenderResult => {
	const queryClient = new QueryClient();
	return render(
		<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
	);
};

describe("RoleList", () => {
	it("renders an empty state when there are no roles", (): void => {
		renderWithClient(<RoleList roles={[]} />);
		expect(screen.getByText("No roles yet.")).toBeInTheDocument();
	});
});
