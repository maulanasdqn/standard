import { PERMISSION } from "@app/permissions";
import {
	noteAttachmentIdInputSchema,
	noteAttachmentListInputSchema,
	noteAttachmentListSchema,
	noteAttachmentSchema,
	noteAttachmentUploadInputSchema,
} from "@app/schemas";
import { z } from "zod";
import { noteAttachmentList } from "#/note/application/note-attachment-list.ts";
import { noteAttachmentRemove } from "#/note/application/note-attachment-remove.ts";
import { noteAttachmentUpload } from "#/note/application/note-attachment-upload.ts";
import { HTTP_METHOD } from "#/platform/http/http-methods.ts";
import { ROUTE_PATH } from "#/platform/http/route-paths.ts";
import { permissionRequire } from "#/platform/orpc/middleware.ts";
import {
	effectRun,
	effectRunTransactional,
} from "#/platform/orpc/run-effect.ts";

const noteAttachmentRouterCreate = () => ({
	list: permissionRequire(PERMISSION.NOTE_READ)
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.NOTE_ATTACHMENTS })
		.input(noteAttachmentListInputSchema)
		.output(noteAttachmentListSchema)
		.handler(({ input, context }) =>
			effectRun(
				context.runtime,
				noteAttachmentList(input, context.session!.user),
			),
		),

	upload: permissionRequire(PERMISSION.NOTE_WRITE)
		.route({ method: HTTP_METHOD.POST, path: ROUTE_PATH.NOTE_ATTACHMENTS })
		.input(noteAttachmentUploadInputSchema)
		.output(noteAttachmentSchema)
		.handler(({ input, context }) =>
			effectRun(
				context.runtime,
				noteAttachmentUpload(input, context.session!.user),
			),
		),

	remove: permissionRequire(PERMISSION.NOTE_WRITE)
		.route({ method: HTTP_METHOD.DELETE, path: ROUTE_PATH.NOTE_ATTACHMENT })
		.input(noteAttachmentIdInputSchema)
		.output(z.object({ id: z.uuid() }))
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				noteAttachmentRemove(input, context.session!.user),
			),
		),
});

export type TNoteAttachmentRouter = ReturnType<
	typeof noteAttachmentRouterCreate
>;

export const noteAttachmentRouterBuild = (): TNoteAttachmentRouter =>
	noteAttachmentRouterCreate();
