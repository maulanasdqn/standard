import {
	type TConfirmedAction,
	useConfirmedAction,
} from "#/routes/_authenticated/_hooks/use-confirmed-action.ts";
import { useSessionSignOut } from "#/routes/_authenticated/_hooks/use-session-sign-out.ts";

export const useSignOutConfirm = (): TConfirmedAction<void> => {
	const signOut = useSessionSignOut();
	return useConfirmedAction<void>((): void => void signOut());
};
