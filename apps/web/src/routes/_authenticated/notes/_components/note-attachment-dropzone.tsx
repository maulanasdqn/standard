import { cn } from "@app/components/lib/utils";
import { formatBytes } from "@app/format";
import { NOTE_ATTACHMENT_MESSAGE } from "@app/messages";
import {
	NOTE_ATTACHMENT_CONTENT_TYPES,
	NOTE_ATTACHMENT_MAX_BYTES,
} from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { ImagePlus, Loader2 } from "lucide-react";
import type { ChangeEvent, DragEvent, FC, ReactElement } from "react";
import { match } from "ts-pattern";

const ACCEPT = A.join(NOTE_ATTACHMENT_CONTENT_TYPES, ",");

type TNoteAttachmentDropzoneProps = {
	inputId: string;
	isDragging: boolean;
	isUploading: boolean;
	isFull: boolean;
	onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onDragOver: (event: DragEvent<HTMLElement>) => void;
	onDragLeave: () => void;
	onDrop: (event: DragEvent<HTMLElement>) => void;
};

const hintOf = (props: TNoteAttachmentDropzoneProps): string =>
	match(props)
		.with({ isUploading: true }, () => NOTE_ATTACHMENT_MESSAGE.UPLOADING)
		.with({ isFull: true }, () => NOTE_ATTACHMENT_MESSAGE.FULL)
		.otherwise(() => NOTE_ATTACHMENT_MESSAGE.DROP_HINT);

export const NoteAttachmentDropzone: FC<TNoteAttachmentDropzoneProps> = (
	props,
): ReactElement => (
	<label
		htmlFor={props.inputId}
		onDragOver={props.onDragOver}
		onDragLeave={props.onDragLeave}
		onDrop={props.onDrop}
		className={cn(
			"flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
			props.isDragging
				? "border-primary bg-primary/5"
				: "border-muted-foreground/25 bg-muted/20 hover:bg-muted/40",
			props.isFull && "pointer-events-none opacity-60",
		)}
	>
		<span className="flex size-11 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
			{props.isUploading ? (
				<Loader2 className="size-5 animate-spin" />
			) : (
				<ImagePlus className="size-5" />
			)}
		</span>
		<span className="flex flex-col gap-1">
			<span className="text-sm font-medium">{hintOf(props)}</span>
			<span className="text-xs text-muted-foreground">
				{NOTE_ATTACHMENT_MESSAGE.ALLOWED_TYPES}
			</span>
			<span className="text-xs text-muted-foreground">
				{NOTE_ATTACHMENT_MESSAGE.MAX_SIZE}{" "}
				{formatBytes(NOTE_ATTACHMENT_MAX_BYTES)}
			</span>
		</span>
		<span className="rounded-md border bg-background px-3 py-1.5 text-xs font-medium shadow-sm">
			{NOTE_ATTACHMENT_MESSAGE.BROWSE}
		</span>
		<input
			id={props.inputId}
			type="file"
			multiple
			accept={ACCEPT}
			disabled={props.isFull || props.isUploading}
			className="sr-only"
			onChange={props.onInputChange}
		/>
	</label>
);
