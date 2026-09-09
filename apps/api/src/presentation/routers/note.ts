import { PERMISSION } from "@app/permissions";
import {
	noteCreateInputSchema,
	noteListInputSchema,
	noteIdInputSchema,
	noteListSchema,
	noteSchema,
	noteUpdateInputSchema,
} from "@app/schemas";
import { z } from "zod";
import { noteCreate } from "#/application/note/note-create.ts";
import { noteDelete } from "#/application/note/note-delete.ts";
import { noteGet } from "#/application/note/note-get.ts";
import { noteList } from "#/application/note/note-list.ts";
import { noteUpdate } from "#/application/note/note-update.ts";
import { permissionRequire } from "#/presentation/orpc/middleware.ts";
import { effectRun } from "#/presentation/orpc/run-effect.ts";

export const noteRouterBuild = () => ({
	list: permissionRequire(PERMISSION.NOTE_READ)
		.route({ method: "GET", path: "/notes" })
		.input(noteListInputSchema)
		.output(noteListSchema)
		.handler(({ input }) => effectRun(noteList(input))),

	get: permissionRequire(PERMISSION.NOTE_READ)
		.route({ method: "GET", path: "/notes/{id}" })
		.input(noteIdInputSchema)
		.output(noteSchema)
		.handler(({ input }) => effectRun(noteGet(input))),

	create: permissionRequire(PERMISSION.NOTE_WRITE)
		.route({ method: "POST", path: "/notes" })
		.input(noteCreateInputSchema)
		.output(noteSchema)
		.handler(({ input, context }) =>
			effectRun(noteCreate(input, context.session!.user.id)),
		),

	update: permissionRequire(PERMISSION.NOTE_WRITE)
		.route({ method: "PATCH", path: "/notes/{id}" })
		.input(noteUpdateInputSchema)
		.output(noteSchema)
		.handler(({ input, context }) =>
			effectRun(noteUpdate(input, context.session!.user.id)),
		),

	remove: permissionRequire(PERMISSION.NOTE_DELETE)
		.route({ method: "DELETE", path: "/notes/{id}" })
		.input(noteIdInputSchema)
		.output(z.object({ id: z.uuid() }))
		.handler(({ input, context }) =>
			effectRun(noteDelete(input, context.session!.user.id)),
		),
});
