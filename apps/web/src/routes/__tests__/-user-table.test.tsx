import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderResult, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import type { TSearchControl } from "#/libs/forms/use-search-form.ts";
import type { TSearchBoxProps } from "#/routes/_authenticated/_components/search-box.tsx";
import { describe, expect, it, vi } from "vitest";
import { SORT_DIRECTION, USER_SORT } from "@app/schemas";
import { UserTable } from "#/routes/_authenticated/users/_components/user-table.tsx";

vi.mock("#/routes/_authenticated/users/_components/user-filters.tsx", () => ({
	UserFilters: (): ReactElement => <button type="button">Filters</button>,
}));

const SEARCH_LABEL = "Search users";

vi.mock(
	"#/routes/_authenticated/users/_hooks/use-users.ts",
	async (importOriginal) => ({
		...(await importOriginal<Record<string, unknown>>()),
		useUserSearch: (): TSearchControl => ({ value: "", onChange: vi.fn() }),
	}),
);

vi.mock("#/routes/_authenticated/_components/search-box.tsx", () => ({
	SearchBox: (props: TSearchBoxProps): ReactElement => (
		<input aria-label={props.label} />
	),
}));

const renderWithClient = (ui: ReactElement): RenderResult => {
	const queryClient = new QueryClient();
	return render(
		<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
	);
};

describe("UserTable", () => {
	it("renders an empty state when there are no users", (): void => {
		renderWithClient(
			<UserTable
				list={{ items: [], total: 0, page: 1, pageSize: 20 }}
				roleOptions={[]}
				sortBy={USER_SORT.CREATED_AT}
				sortDir={SORT_DIRECTION.ASC}
				onChange={() => undefined}
			/>,
		);
		expect(screen.getByText("No users yet.")).toBeInTheDocument();
	});

	it("keeps the search box when a search finds nothing", (): void => {
		renderWithClient(
			<UserTable
				list={{ items: [], total: 0, page: 1, pageSize: 20 }}
				roleOptions={[]}
				sortBy={USER_SORT.CREATED_AT}
				sortDir={SORT_DIRECTION.ASC}
				onChange={() => undefined}
			/>,
		);
		expect(screen.getByLabelText(SEARCH_LABEL)).toBeInTheDocument();
	});
});
