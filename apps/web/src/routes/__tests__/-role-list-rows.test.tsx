import { NOT_SET } from "@app/format";
import { ROLE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import type { TRoleDto } from "@app/schemas";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderResult, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { RoleList } from "#/routes/_authenticated/roles/_components/role-list.tsx";

const ACTIONS_LABEL = "role actions";

vi.mock(
	"#/routes/_authenticated/roles/_components/role-actions-cell.tsx",
	() => ({
		RoleActionsCell: (): ReactElement => <span>{ACTIONS_LABEL}</span>,
	}),
);

const roles: readonly TRoleDto[] = [
	{
		key: "admin",
		label: "Admin",
		description: null,
		permissions: [PERMISSION.NOTE_READ, PERMISSION.NOTE_WRITE],
		fixed: true,
		memberCount: 2,
	},
	{
		key: "reviewer",
		label: "Reviewer",
		description: "Reads notes",
		permissions: [PERMISSION.NOTE_READ],
		fixed: false,
		memberCount: 0,
	},
];

const renderRows = (): RenderResult => {
	const queryClient = new QueryClient();
	return render(
		<QueryClientProvider client={queryClient}>
			<RoleList roles={roles} />
		</QueryClientProvider>,
	);
};

describe("RoleList with rows", () => {
	it("renders every role with its label and key", (): void => {
		renderRows();

		expect(screen.getByRole("row", { name: /admin/i })).toBeVisible();
		expect(screen.getByRole("row", { name: /reviewer/i })).toBeVisible();
		expect(screen.queryByText("No roles yet.")).not.toBeInTheDocument();
	});

	it("marks only the fixed roles", (): void => {
		renderRows();

		const badges = screen.getAllByText(ROLE_MESSAGE.FIXED_BADGE);
		expect(badges).toHaveLength(1);
		expect(screen.getByRole("row", { name: /admin/i })).toHaveTextContent(
			ROLE_MESSAGE.FIXED_BADGE,
		);
	});

	it("shows a dash for a role without a description", (): void => {
		renderRows();

		expect(screen.getByRole("row", { name: /admin/i })).toHaveTextContent(
			NOT_SET,
		);
		expect(screen.getByRole("row", { name: /reviewer/i })).toHaveTextContent(
			"Reads notes",
		);
	});

	it("counts the permissions and the members per role", (): void => {
		renderRows();

		const admin = screen.getByRole("row", { name: /admin/i });
		expect(admin.querySelectorAll("td")[3]?.textContent).toBe(
			String(roles[0]?.permissions.length),
		);
		expect(admin.querySelectorAll("td")[4]?.textContent).toBe(
			String(roles[0]?.memberCount),
		);
	});

	it("gives every row its actions cell", (): void => {
		renderRows();

		expect(screen.getAllByText(ACTIONS_LABEL)).toHaveLength(roles.length);
	});
});
