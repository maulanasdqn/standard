import { type TUser, type TUserStatus, USER_STATUS } from "@app/schemas";
import {
	type TConfirmedAction,
	useConfirmedAction,
} from "#/routes/_authenticated/_hooks/use-confirmed-action.ts";
import {
	useUserDeactivate,
	useUserReactivate,
} from "#/routes/_authenticated/users/_hooks/use-user-admin.ts";
import { userStatusOf } from "#/routes/_authenticated/users/_utils/user-status.ts";

export type TUserAccess = {
	status: TUserStatus;
	deactivated: boolean;
	pending: boolean;
	confirm: TConfirmedAction<void>;
};

export const useUserAccess = (user: TUser): TUserAccess => {
	const userDeactivate = useUserDeactivate();
	const userReactivate = useUserReactivate();
	const status = userStatusOf(user);
	const deactivated = status === USER_STATUS.DEACTIVATED;
	const confirm = useConfirmedAction<void>((): void =>
		deactivated
			? userReactivate.mutate({ id: user.id })
			: userDeactivate.mutate({ id: user.id }),
	);

	return {
		status,
		deactivated,
		pending: userDeactivate.isPending || userReactivate.isPending,
		confirm,
	};
};
