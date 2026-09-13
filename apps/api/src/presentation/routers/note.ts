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
import { HTTP_METHOD } from "#/presentation/http-methods.ts";
import { ROUTE_PATH } from "#/presentation/route-paths.ts";

export const noteRouterBuild = () => ({
	list: permissionRequire(PERMISSION.NOTE_READ)
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.NOTES })
		.input(noteListInputSchema)
		.output(noteListSchema)
		.handler(({ input }) => effectRun(noteList(input))),

	get: permissionRequire(PERMISSION.NOTE_READ)
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.NOTE })
		.input(noteIdInputSchema)
		.output(noteSchema)
		.handler(({ input }) => effectRun(noteGet(input))),

	create: permissionRequire(PERMISSION.NOTE_WRITE)
		.route({ method: HTTP_METHOD.POST, path: ROUTE_PATH.NOTES })
		.input(noteCreateInputSchema)
		.output(noteSchema)
		.handler(({ input, context }) =>
			effectRun(noteCreate(input, context.session!.user.id)),
		),

	update: permissionRequire(PERMISSION.NOTE_WRITE)
		.route({ method: HTTP_METHOD.PATCH, path: ROUTE_PATH.NOTE })
		.input(noteUpdateInputSchema)
		.output(noteSchema)
		.handler(({ input, context }) =>
			effectRun(noteUpdate(input, context.session!.user.id)),
		),

	remove: permissionRequire(PERMISSION.NOTE_DELETE)
		.route({ method: HTTP_METHOD.DELETE, path: ROUTE_PATH.NOTE })
		.input(noteIdInputSchema)
		.output(z.object({ id: z.uuid() }))
		.handler(({ input, context }) =>
			effectRun(noteDelete(input, context.session!.user.id)),
		),
});
