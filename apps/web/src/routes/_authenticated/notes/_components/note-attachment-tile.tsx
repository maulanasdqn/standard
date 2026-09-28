import { Guard } from "@app/components/guard/guard";
import { Button } from "@app/components/ui/button";
import { formatBytes } from "@app/format";
import { NOTE_ATTACHMENT_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import type { TNoteAttachment } from "@app/schemas";
import { ExternalLink, Trash2 } from "lucide-react";
import type { FC, ReactElement } from "react";

type TNoteAttachmentTileProps = {
	attachment: TNoteAttachment;
	onRemove: (id: string) => void;
};

export const NoteAttachmentTile: FC<TNoteAttachmentTileProps> = (
	props,
): ReactElement => (
	<li className="group relative overflow-hidden rounded-xl border bg-muted">
		<img
			src={props.attachment.url}
			alt={props.attachment.fileName}
			loading="lazy"
			className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
		/>
		<div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/75 via-black/10 to-black/20 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
			<div className="flex justify-end gap-1 p-2">
				<Button
					asChild
					size="icon"
					variant="secondary"
					className="size-7 rounded-full"
				>
					<a
						href={props.attachment.url}
						target="_blank"
						rel="noreferrer"
						aria-label={NOTE_ATTACHMENT_MESSAGE.ACTION_OPEN}
					>
						<ExternalLink className="size-3.5" />
					</a>
				</Button>
				<Guard permissions={[PERMISSION.NOTE_WRITE]}>
					<Button
						type="button"
						size="icon"
						variant="destructive"
						className="size-7 rounded-full"
						aria-label={NOTE_ATTACHMENT_MESSAGE.ACTION_DELETE}
						onClick={() => props.onRemove(props.attachment.id)}
					>
						<Trash2 className="size-3.5" />
					</Button>
				</Guard>
			</div>
			<div className="flex flex-col p-2 text-left">
				<span className="truncate text-xs font-medium text-white">
					{props.attachment.fileName}
				</span>
				<span className="text-[11px] text-white/70">
					{formatBytes(props.attachment.byteSize)}
				</span>
			</div>
		</div>
	</li>
);
