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
import { noteCreate } from "#/note/application/note-create.ts";
import { noteDelete } from "#/note/application/note-delete.ts";
import { noteGet } from "#/note/application/note-get.ts";
import { noteList } from "#/note/application/note-list.ts";
import { noteUpdate } from "#/note/application/note-update.ts";
import { permissionRequire } from "#/platform/orpc/middleware.ts";
import {
	effectRun,
	effectRunTransactional,
} from "#/platform/orpc/run-effect.ts";
import { HTTP_METHOD } from "#/platform/http/http-methods.ts";
import { ROUTE_PATH } from "#/platform/http/route-paths.ts";

const noteRouter = {
	list: permissionRequire(PERMISSION.NOTE_READ)
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.NOTES })
		.input(noteListInputSchema)
		.output(noteListSchema)
		.handler(({ input, context }) =>
			effectRun(context.runtime, noteList(input, context.session!.user)),
		),

	get: permissionRequire(PERMISSION.NOTE_READ)
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.NOTE })
		.input(noteIdInputSchema)
		.output(noteSchema)
		.handler(({ input, context }) =>
			effectRun(context.runtime, noteGet(input, context.session!.user)),
		),

	create: permissionRequire(PERMISSION.NOTE_WRITE)
		.route({ method: HTTP_METHOD.POST, path: ROUTE_PATH.NOTES })
		.input(noteCreateInputSchema)
		.output(noteSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				noteCreate(input, context.session!.user),
			),
		),

	update: permissionRequire(PERMISSION.NOTE_WRITE)
		.route({ method: HTTP_METHOD.PATCH, path: ROUTE_PATH.NOTE })
		.input(noteUpdateInputSchema)
		.output(noteSchema)
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				noteUpdate(input, context.session!.user),
			),
		),

	remove: permissionRequire(PERMISSION.NOTE_DELETE)
		.route({ method: HTTP_METHOD.DELETE, path: ROUTE_PATH.NOTE })
		.input(noteIdInputSchema)
		.output(z.object({ id: z.uuid() }))
		.handler(({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				noteDelete(input, context.session!.user),
			),
		),
};

export type TNoteRouter = typeof noteRouter;

export const noteRouterBuild = (): TNoteRouter => noteRouter;
