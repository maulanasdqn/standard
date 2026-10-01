import type { TUser } from "@app/schemas";
import {
	type TConfirmedAction,
	useConfirmedAction,
} from "#/routes/_authenticated/_hooks/use-confirmed-action.ts";
import { useUserTwoFactorReset } from "#/routes/_authenticated/users/_hooks/use-user-admin.ts";

export type TUserTwoFactor = {
	pending: boolean;
	confirm: TConfirmedAction<void>;
};

export const useUserTwoFactor = (user: TUser): TUserTwoFactor => {
	const reset = useUserTwoFactorReset();
	const confirm = useConfirmedAction<void>((): void =>
		reset.mutate({ id: user.id }),
	);

	return { pending: reset.isPending, confirm };
};
