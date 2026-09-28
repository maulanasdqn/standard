import { Badge } from "@app/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import { NOTE_ATTACHMENT_MESSAGE } from "@app/messages";
import { NOTE_ATTACHMENT_MAX_PER_NOTE } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import type { FC, ReactElement } from "react";
import { match } from "ts-pattern";
import { ConfirmDialog } from "#/routes/_authenticated/_components/confirm-dialog.tsx";
import { EmptyState } from "#/routes/_authenticated/_components/empty-state.tsx";
import { NoteAttachmentDropzone } from "#/routes/_authenticated/notes/_components/note-attachment-dropzone.tsx";
import { NoteAttachmentTile } from "#/routes/_authenticated/notes/_components/note-attachment-tile.tsx";
import { useNoteAttachmentPanel } from "#/routes/_authenticated/notes/_hooks/use-note-attachment-panel.ts";

type TNoteAttachmentPanelProps = {
	noteId: string;
};

export const NoteAttachmentPanel: FC<TNoteAttachmentPanelProps> = (
	props,
): ReactElement => {
	const panel = useNoteAttachmentPanel(props.noteId);

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between gap-4">
					<div className="flex flex-col gap-1.5">
						<CardTitle>{NOTE_ATTACHMENT_MESSAGE.TITLE}</CardTitle>
						<CardDescription>
							{NOTE_ATTACHMENT_MESSAGE.DESCRIPTION}
						</CardDescription>
					</div>
					<Badge variant="outline">
						{panel.items.length} / {NOTE_ATTACHMENT_MAX_PER_NOTE}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-6">
				<NoteAttachmentDropzone
					isDragging={panel.isDragging}
					isUploading={panel.isUploading}
					isFull={panel.isFull}
					inputId={panel.inputId}
					onInputChange={panel.onInputChange}
					onDragOver={panel.onDragOver}
					onDragLeave={panel.onDragLeave}
					onDrop={panel.onDrop}
				/>
				{match(A.isEmpty(panel.items))
					.with(true, () => (
						<EmptyState message={NOTE_ATTACHMENT_MESSAGE.EMPTY} />
					))
					.otherwise(() => (
						<ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
							{A.map(panel.items, (attachment) => (
								<NoteAttachmentTile
									key={attachment.id}
									attachment={attachment}
									onRemove={panel.onRemoveRequest}
								/>
							))}
						</ul>
					))}
			</CardContent>
			<ConfirmDialog
				open={panel.removal.open}
				title={NOTE_ATTACHMENT_MESSAGE.DELETE_CONFIRM_TITLE}
				description={NOTE_ATTACHMENT_MESSAGE.DELETE_CONFIRM_DESCRIPTION}
				onOpenChange={panel.removal.onOpenChange}
				onConfirm={panel.removal.onConfirm}
			/>
		</Card>
	);
};
