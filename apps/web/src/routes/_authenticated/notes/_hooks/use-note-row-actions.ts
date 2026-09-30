import { usePermissions } from "@app/components/guard/use-permissions";
import { APP_MESSAGE, NOTE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import type { TNote } from "@app/schemas";
import { useNavigate } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import {
	ROW_ACTION,
	type TRowAction,
} from "#/routes/_authenticated/_constants/row-action.ts";
import type { TConfirmedAction } from "#/routes/_authenticated/_hooks/use-confirmed-action.ts";
import { useRowDeleteConfirm } from "#/routes/_authenticated/_hooks/use-row-delete-confirm.ts";
import { useNoteDelete } from "#/routes/_authenticated/notes/_hooks/use-notes.ts";

const NOTE_OPEN_PERMISSIONS = [PERMISSION.NOTE_UPDATE];

export type TNoteRowActions = {
	actions: readonly TRowAction[];
	confirm: TConfirmedAction<void>;
};

export const useNoteRowActions = (note: TNote): TNoteRowActions => {
	const navigate = useNavigate();
	const noteDelete = useNoteDelete();
	const confirm = useRowDeleteConfirm(() => noteDelete.mutate({ id: note.id }));

	return {
		confirm,
		actions: [
			{
				id: ROW_ACTION.EDIT,
				label: NOTE_MESSAGE.ACTION_EDIT,
				icon: Pencil,
				permissions: NOTE_OPEN_PERMISSIONS,
				onSelect: (): void =>
					void navigate({ to: "/notes/$noteId", params: { noteId: note.id } }),
			},
			{
				id: ROW_ACTION.DELETE,
				label: APP_MESSAGE.DELETE,
				icon: Trash2,
				permissions: [PERMISSION.NOTE_DELETE],
				destructive: true,
				disabled: noteDelete.isPending,
				onSelect: (): void => confirm.request(),
			},
		],
	};
};

export const useNoteRowOpen = (): ((note: TNote) => void) | undefined => {
	const navigate = useNavigate();
	const { canAll } = usePermissions();

	return canAll(NOTE_OPEN_PERMISSIONS)
		? (note: TNote): void =>
				void navigate({ to: "/notes/$noteId", params: { noteId: note.id } })
		: undefined;
};
