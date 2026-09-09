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
import { createNote } from "#/application/note/create-note.ts";
import { deleteNote } from "#/application/note/delete-note.ts";
import { getNote } from "#/application/note/get-note.ts";
import { listNotes } from "#/application/note/list-notes.ts";
import { updateNote } from "#/application/note/update-note.ts";
import { requirePermission } from "#/presentation/orpc/middleware.ts";
import { runEffect } from "#/presentation/orpc/run-effect.ts";

export const buildNoteRouter = () => ({
	list: requirePermission(PERMISSION.NOTE_READ)
		.route({ method: "GET", path: "/notes" })
		.input(listNotesInputSchema)
		.output(noteListSchema)
		.handler(({ input }) => runEffect(listNotes(input))),

	get: requirePermission(PERMISSION.NOTE_READ)
		.route({ method: "GET", path: "/notes/{id}" })
		.input(noteIdInputSchema)
		.output(noteSchema)
		.handler(({ input }) => runEffect(getNote(input))),

	create: requirePermission(PERMISSION.NOTE_WRITE)
		.route({ method: "POST", path: "/notes" })
		.input(createNoteInputSchema)
		.output(noteSchema)
		.handler(({ input, context }) =>
			runEffect(createNote(input, context.session!.user.id)),
		),

	update: requirePermission(PERMISSION.NOTE_WRITE)
		.route({ method: "PATCH", path: "/notes/{id}" })
		.input(updateNoteInputSchema)
		.output(noteSchema)
		.handler(({ input, context }) =>
			runEffect(updateNote(input, context.session!.user.id)),
		),

	remove: requirePermission(PERMISSION.NOTE_DELETE)
		.route({ method: "DELETE", path: "/notes/{id}" })
		.input(noteIdInputSchema)
		.output(z.object({ id: z.uuid() }))
		.handler(({ input, context }) =>
			runEffect(deleteNote(input, context.session!.user.id)),
		),
});
