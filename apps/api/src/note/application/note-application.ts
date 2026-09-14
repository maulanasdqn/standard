import type {
	TNote,
	TNoteCreateInput,
	TNoteIdInput,
	TNoteList,
	TNoteListInput,
	TNoteUpdateInput,
} from "@app/schemas";
import { noteCreate } from "#/note/application/note-create.ts";
import { noteDelete } from "#/note/application/note-delete.ts";
import { noteGet } from "#/note/application/note-get.ts";
import { noteList } from "#/note/application/note-list.ts";
import { noteUpdate } from "#/note/application/note-update.ts";
import type { TBaseApplication } from "#/shared/base-application.ts";

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
