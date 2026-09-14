import type {
	TNote,
	TNoteCreateInput,
	TNoteIdInput,
	TNoteList,
	TNoteListInput,
	TNoteUpdateInput,
} from "@app/schemas";
import { noteCreate } from "#/application/note/note-create.ts";
import { noteDelete } from "#/application/note/note-delete.ts";
import { noteGet } from "#/application/note/note-get.ts";
import { noteList } from "#/application/note/note-list.ts";
import { noteUpdate } from "#/application/note/note-update.ts";
import type { TBaseApplication } from "#/application/shared/base-application.ts";

export const noteApplication = {
	list: noteList,
	get: noteGet,
	create: noteCreate,
	update: noteUpdate,
	remove: noteDelete,
} satisfies TBaseApplication<
	TNote,
	TNoteList,
	TNoteIdInput,
	{
		list: TNoteListInput;
		get: TNoteIdInput;
		create: TNoteCreateInput;
		update: TNoteUpdateInput;
		remove: TNoteIdInput;
	}
>;
