import { NOTE_ATTACHMENT_MESSAGE } from "@app/messages";
import {
	NOTE_ATTACHMENT_MAX_PER_NOTE,
	noteAttachmentFileSchema,
	type TNoteAttachment,
} from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { useId, useState, type ChangeEvent, type DragEvent } from "react";
import { toast } from "sonner";
import { match } from "ts-pattern";
import type { TConfirmedAction } from "#/routes/_authenticated/_hooks/use-confirmed-action.ts";
import { useConfirmedAction } from "#/routes/_authenticated/_hooks/use-confirmed-action.ts";
import {
	useNoteAttachmentList,
	useNoteAttachmentRemove,
	useNoteAttachmentUpload,
} from "#/routes/_authenticated/notes/_hooks/use-note-attachments.ts";

export type TNoteAttachmentPanel = {
	items: readonly TNoteAttachment[];
	remaining: number;
	isFull: boolean;
	isUploading: boolean;
	isDragging: boolean;
	inputId: string;
	onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onDragOver: (event: DragEvent<HTMLElement>) => void;
	onDragLeave: () => void;
	onDrop: (event: DragEvent<HTMLElement>) => void;
	onRemoveRequest: (id: string) => void;
	removal: TConfirmedAction<string>;
};

const accepted = (files: readonly File[]): readonly File[] =>
	A.filter(files, (file) => noteAttachmentFileSchema.safeParse(file).success);

export const useNoteAttachmentPanel = (
	noteId: string,
): TNoteAttachmentPanel => {
	const { data } = useNoteAttachmentList(noteId);
	const upload = useNoteAttachmentUpload();
	const remove = useNoteAttachmentRemove();
	const inputId = useId();
	const [isDragging, setIsDragging] = useState(false);

	const remaining = NOTE_ATTACHMENT_MAX_PER_NOTE - data.length;

	const removal = useConfirmedAction<string>((id) => remove.mutate({ id }));

	const send = (files: readonly File[]): void => {
		const allowed = accepted(files);
		const queued = A.take(allowed, Math.max(remaining, 0));

		match(allowed.length === files.length)
			.with(false, () => toast.error(NOTE_ATTACHMENT_MESSAGE.REJECTED))
			.otherwise(() => undefined);

		match(A.isEmpty(queued))
			.with(true, () => undefined)
			.otherwise(() => {
				void Promise.all(
					A.map(queued, (file) =>
						upload.mutateAsync({ noteId, file }).catch(() => undefined),
					),
				).then(() => toast.success(NOTE_ATTACHMENT_MESSAGE.UPLOADED));
			});
	};

	return {
		items: data,
		remaining,
		isFull: remaining <= 0,
		isUploading: upload.isPending,
		isDragging,
		inputId,
		onInputChange: (event: ChangeEvent<HTMLInputElement>): void => {
			send([...(event.target.files ?? [])]);
			event.target.value = "";
		},
		onDragOver: (event: DragEvent<HTMLElement>): void => {
			event.preventDefault();
			setIsDragging(true);
		},
		onDragLeave: (): void => setIsDragging(false),
		onDrop: (event: DragEvent<HTMLElement>): void => {
			event.preventDefault();
			setIsDragging(false);
			send([...event.dataTransfer.files]);
		},
		onRemoveRequest: removal.request,
		removal,
	};
};
