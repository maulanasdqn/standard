import { PERMISSION } from "@app/permissions";
import {
	createNoteInputSchema,
	listNotesInputSchema,
	noteIdInputSchema,
	noteListSchema,
	noteSchema,
	updateNoteInputSchema,
} from "@app/schemas";
import { z } from "zod";
import { requirePermission } from "#/presentation/orpc/middleware.ts";

export const buildNoteRouter = () => ({
	list: requirePermission(PERMISSION.NOTE_READ)
		.route({ method: "GET", path: "/notes" })
		.input(listNotesInputSchema)
		.output(noteListSchema)
		.handler(({ input, context }) => context.useCases.note.list(input)),

	get: requirePermission(PERMISSION.NOTE_READ)
		.route({ method: "GET", path: "/notes/{id}" })
		.input(noteIdInputSchema)
		.output(noteSchema)
		.handler(({ input, context }) => context.useCases.note.get(input)),

	create: requirePermission(PERMISSION.NOTE_WRITE)
		.route({ method: "POST", path: "/notes" })
		.input(createNoteInputSchema)
		.output(noteSchema)
		.handler(({ input, context }) =>
			context.useCases.note.create(input, context.session!.user.id),
		),

	update: requirePermission(PERMISSION.NOTE_WRITE)
		.route({ method: "PATCH", path: "/notes/{id}" })
		.input(updateNoteInputSchema)
		.output(noteSchema)
		.handler(({ input, context }) =>
			context.useCases.note.update(input, context.session!.user.id),
		),

	remove: requirePermission(PERMISSION.NOTE_DELETE)
		.route({ method: "DELETE", path: "/notes/{id}" })
		.input(noteIdInputSchema)
		.output(z.object({ id: z.uuid() }))
		.handler(({ input, context }) =>
			context.useCases.note.remove(input, context.session!.user.id),
		),
});
