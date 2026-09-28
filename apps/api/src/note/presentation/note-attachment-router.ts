import { PERMISSION } from "@app/permissions";
import { noteAttachmentList } from "#/note/application/note-attachment-list.ts";
import { noteAttachmentRemove } from "#/note/application/note-attachment-remove.ts";
import { noteAttachmentUpload } from "#/note/application/note-attachment-upload.ts";
import { implementer, permissionGuarded } from "#/platform/orpc/implementer.ts";
import {
	effectRun,
	effectRunTransactional,
} from "#/platform/orpc/run-effect.ts";

export const noteAttachmentRouter = implementer.note.attachment.router({
	list: permissionGuarded(PERMISSION.NOTE_READ).note.attachment.list.handler(
		({ input, context }) =>
			effectRun(
				context.runtime,
				noteAttachmentList(input, context.session.user),
			),
	),

	upload: permissionGuarded(
		PERMISSION.NOTE_WRITE,
	).note.attachment.upload.handler(({ input, context }) =>
		effectRun(
			context.runtime,
			noteAttachmentUpload(input, context.session.user),
		),
	),

	remove: permissionGuarded(
		PERMISSION.NOTE_WRITE,
	).note.attachment.remove.handler(({ input, context }) =>
		effectRunTransactional(
			context.runtime,
			noteAttachmentRemove(input, context.session.user),
		),
	),
});
