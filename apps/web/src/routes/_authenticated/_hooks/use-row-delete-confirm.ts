import {
	type TConfirmedAction,
	useConfirmedAction,
} from "#/routes/_authenticated/_hooks/use-confirmed-action.ts";

export const useRowDeleteConfirm = (
	remove: () => void,
): TConfirmedAction<void> => useConfirmedAction<void>(() => remove());
