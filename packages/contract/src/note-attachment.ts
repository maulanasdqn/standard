import {
	noteAttachmentIdInputSchema,
	noteAttachmentListInputSchema,
	noteAttachmentListSchema,
	noteAttachmentSchema,
	noteAttachmentUploadInputSchema,
} from "@app/schemas";
import { oc } from "@orpc/contract";
import { z } from "zod";
import { HTTP_METHOD } from "./http-methods.ts";
import { ROUTE_PATH } from "./route-paths.ts";

export const noteAttachmentContract = {
	list: oc
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.NOTE_ATTACHMENTS })
		.input(noteAttachmentListInputSchema)
		.output(noteAttachmentListSchema),

	upload: oc
		.route({ method: HTTP_METHOD.POST, path: ROUTE_PATH.NOTE_ATTACHMENTS })
		.input(noteAttachmentUploadInputSchema)
		.output(noteAttachmentSchema),

	remove: oc
		.route({ method: HTTP_METHOD.DELETE, path: ROUTE_PATH.NOTE_ATTACHMENT })
		.input(noteAttachmentIdInputSchema)
		.output(z.object({ id: z.uuid() })),
};
