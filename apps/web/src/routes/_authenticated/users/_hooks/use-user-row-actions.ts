import { usePermissions } from "@app/components/guard/use-permissions";
import { APP_MESSAGE, USER_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import type { TUser } from "@app/schemas";
import { useNavigate } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import {
	ROW_ACTION,
	type TRowAction,
} from "#/routes/_authenticated/_constants/row-action.ts";
import type { TConfirmedAction } from "#/routes/_authenticated/_hooks/use-confirmed-action.ts";
import { useRowDeleteConfirm } from "#/routes/_authenticated/_hooks/use-row-delete-confirm.ts";
import { useUserDelete } from "#/routes/_authenticated/users/_hooks/use-users.ts";

const USER_OPEN_PERMISSIONS = [
	PERMISSION.USER_READ,
	PERMISSION.USER_UPDATE,
	PERMISSION.ROLE_READ,
];

export type TUserRowActions = {
	actions: readonly TRowAction[];
	confirm: TConfirmedAction<void>;
};

export const useUserRowActions = (
	user: TUser,
	isSelf: boolean,
): TUserRowActions => {
	const navigate = useNavigate();
	const userDelete = useUserDelete();
	const confirm = useRowDeleteConfirm(() => userDelete.mutate({ id: user.id }));

	return {
		confirm,
		actions: [
			{
				id: ROW_ACTION.EDIT,
				label: USER_MESSAGE.ACTION_EDIT,
				icon: Pencil,
				permissions: USER_OPEN_PERMISSIONS,
				onSelect: (): void =>
					void navigate({ to: "/users/$userId", params: { userId: user.id } }),
			},
			{
				id: ROW_ACTION.DELETE,
				label: APP_MESSAGE.DELETE,
				icon: Trash2,
				permissions: [PERMISSION.USER_DELETE],
				destructive: true,
				disabled: isSelf || userDelete.isPending,
				onSelect: (): void => confirm.request(),
			},
		],
	};
};

export const useUserRowOpen = (): ((user: TUser) => void) | undefined => {
	const navigate = useNavigate();
	const { canAll } = usePermissions();

	return canAll(USER_OPEN_PERMISSIONS)
		? (user: TUser): void =>
				void navigate({ to: "/users/$userId", params: { userId: user.id } })
		: undefined;
};
