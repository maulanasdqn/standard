import { PermissionsProvider } from "@app/components/guard/permissions-provider";
import { PERMISSION, type TPermission } from "@app/permissions";
import { SORT_DIRECTION, type TUser, USER_SORT } from "@app/schemas";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderResult, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { UserTable } from "#/routes/_authenticated/users/_components/user-table.tsx";
import type { TRoleOption } from "#/routes/_authenticated/users/_hooks/use-role-options.ts";

const ACTIONS_LABEL = "user actions";
const CREATED_AT = "2026-01-02T03:04:00.000Z";
const MEMBER_LABEL = "Member";

vi.mock("#/routes/_authenticated/users/_components/user-search.tsx", () => ({
	UserSearch: (): ReactElement => <input aria-label="Search users" />,
}));

vi.mock(
	"#/routes/_authenticated/users/_components/user-actions-cell.tsx",
	() => ({
		UserActionsCell: (): ReactElement => <span>{ACTIONS_LABEL}</span>,
	}),
);

const user: TUser = {
	id: "11111111-1111-4111-8111-111111111111",
	name: "Ada",
	email: "ada@test.app",
	emailVerified: true,
	image: null,
	role: "member",
	createdAt: CREATED_AT,
	updatedAt: CREATED_AT,
};

const roleOptions: readonly TRoleOption[] = [
	{ value: "member", label: MEMBER_LABEL },
	{ value: "viewer", label: "Viewer" },
];

const renderWithPermissions = (
	permissions: readonly TPermission[],
): RenderResult => {
	const queryClient = new QueryClient();
	return render(
		<QueryClientProvider client={queryClient}>
			<PermissionsProvider permissions={permissions}>
				<UserTable
					list={{ items: [user], total: 1, page: 1, pageSize: 20 }}
					roleOptions={roleOptions}
					sortBy={USER_SORT.CREATED_AT}
					sortDir={SORT_DIRECTION.ASC}
					onChange={() => undefined}
				/>
			</PermissionsProvider>
		</QueryClientProvider>,
	);
};

describe("UserTable with rows", () => {
	it("renders the user's name and email in the row", (): void => {
		renderWithPermissions([]);

		const row = screen.getByRole("row", { name: /ada@test\.app/i });
		expect(row).toHaveTextContent("Ada");
		expect(screen.queryByText("No users yet.")).not.toBeInTheDocument();
	});

	it("shows the role as plain text to someone who cannot manage users", (): void => {
		renderWithPermissions([]);

		expect(screen.getByText(MEMBER_LABEL)).toBeVisible();
		expect(
			screen.queryByRole("combobox", { name: `Role for ${user.name}` }),
		).not.toBeInTheDocument();
	});

	it("offers the role as a select to someone who can manage users", (): void => {
		renderWithPermissions([PERMISSION.USER_MANAGE]);

		expect(
			screen.getByRole("combobox", { name: `Role for ${user.name}` }),
		).toBeVisible();
	});

	it("gives the row its actions cell", (): void => {
		renderWithPermissions([]);

		expect(screen.getByText(ACTIONS_LABEL)).toBeVisible();
	});
});
