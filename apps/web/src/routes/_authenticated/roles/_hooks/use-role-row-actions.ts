import { usePermissions } from "@app/components/guard/use-permissions";
import { APP_MESSAGE, ROLE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import type { TRoleDto } from "@app/schemas";
import { useNavigate } from "@tanstack/react-router";
import { Eye, Pencil, Trash2 } from "lucide-react";
import {
	ROW_ACTION,
	type TRowAction,
} from "#/routes/_authenticated/_constants/row-action.ts";
import type { TConfirmedAction } from "#/routes/_authenticated/_hooks/use-confirmed-action.ts";
import { useRowDeleteConfirm } from "#/routes/_authenticated/_hooks/use-row-delete-confirm.ts";
import { useRoleDelete } from "#/routes/_authenticated/roles/_hooks/use-roles.ts";
import { roleDeletable } from "#/routes/_authenticated/roles/_utils/role-deletable.ts";

const ROLE_OPEN_PERMISSIONS = [PERMISSION.ROLE_READ];

export type TRoleRowActions = {
	actions: readonly TRowAction[];
	confirm: TConfirmedAction<void>;
};

export const useRoleRowActions = (role: TRoleDto): TRoleRowActions => {
	const navigate = useNavigate();
	const roleDelete = useRoleDelete();
	const confirm = useRowDeleteConfirm(() =>
		roleDelete.mutate({ key: role.key }),
	);

	return {
		confirm,
		actions: [
			{
				id: ROW_ACTION.VIEW,
				label: ROLE_MESSAGE.ACTION_VIEW,
				icon: Eye,
				permissions: ROLE_OPEN_PERMISSIONS,
				onSelect: (): void =>
					void navigate({ to: "/roles/$key", params: { key: role.key } }),
			},
			{
				id: ROW_ACTION.EDIT,
				label: ROLE_MESSAGE.ACTION_EDIT,
				icon: Pencil,
				permissions: [PERMISSION.ROLE_UPDATE],
				available: !role.fixed,
				onSelect: (): void =>
					void navigate({ to: "/roles/$key/edit", params: { key: role.key } }),
			},
			{
				id: ROW_ACTION.DELETE,
				label: APP_MESSAGE.DELETE,
				icon: Trash2,
				permissions: [PERMISSION.ROLE_DELETE],
				available: roleDeletable(role),
				destructive: true,
				disabled: roleDelete.isPending,
				onSelect: (): void => confirm.request(),
			},
		],
	};
};

export const useRoleRowOpen = (): ((role: TRoleDto) => void) | undefined => {
	const navigate = useNavigate();
	const { canAll } = usePermissions();

	return canAll(ROLE_OPEN_PERMISSIONS)
		? (role: TRoleDto): void =>
				void navigate({ to: "/roles/$key", params: { key: role.key } })
		: undefined;
};
