import { PERMISSION } from "@app/permissions";
import { noteCreate } from "#/note/application/note-create.ts";
import { noteDelete } from "#/note/application/note-delete.ts";
import { noteGet } from "#/note/application/note-get.ts";
import { noteList } from "#/note/application/note-list.ts";
import { noteUpdate } from "#/note/application/note-update.ts";
import { implementer, permissionGuarded } from "#/platform/orpc/implementer.ts";
import {
	effectRun,
	effectRunTransactional,
} from "#/platform/orpc/run-effect.ts";

const noteRouter = implementer.note.router({
	list: permissionGuarded(PERMISSION.NOTE_READ).note.list.handler(
		({ input, context }) =>
			effectRun(context.runtime, noteList(input, context.session.user)),
	),

	get: permissionGuarded(PERMISSION.NOTE_READ).note.get.handler(
		({ input, context }) =>
			effectRun(context.runtime, noteGet(input, context.session.user)),
	),

	create: permissionGuarded(PERMISSION.NOTE_WRITE).note.create.handler(
		({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				noteCreate(input, context.session.user),
			),
	),

	update: permissionGuarded(PERMISSION.NOTE_WRITE).note.update.handler(
		({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				noteUpdate(input, context.session.user),
			),
	),

	remove: permissionGuarded(PERMISSION.NOTE_DELETE).note.remove.handler(
		({ input, context }) =>
			effectRunTransactional(
				context.runtime,
				noteDelete(input, context.session.user),
			),
	),
});

export type TNoteRouter = typeof noteRouter;

export const noteRouterBuild = (): TNoteRouter => noteRouter;
