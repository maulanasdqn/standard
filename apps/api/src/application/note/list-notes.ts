import type { TListNotesInput, TNoteList } from "@app/schemas";
import type { IDependencies } from "#/application/use-cases-deps.ts";
import { toNoteDto } from "#/application/note/to-note-dto.ts";

export const makeListNotes =
	({ noteRepo }: Pick<IDependencies, "noteRepo">) =>
	async (input: TListNotesInput): Promise<TNoteList> => {
		const { items, total } = await noteRepo.list(input);
		return {
			items: items.map(toNoteDto),
			total,
			page: input.page,
			pageSize: input.pageSize,
		};
	};

export type TListNotes = ReturnType<typeof makeListNotes>;
