import type { TListNotesInput, TNoteList } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { toNoteDto } from "#/application/note/to-note-dto.ts";
import type { IDependencies } from "#/application/use-cases-deps.ts";

export const makeListNotes =
	({ noteRepo }: Pick<IDependencies, "noteRepo">) =>
	async (input: TListNotesInput): Promise<TNoteList> => {
		const { items, total } = await noteRepo.list(input);
		return {
			items: A.map(items, toNoteDto),
			total,
			page: input.page,
			pageSize: input.pageSize,
		};
	};

export type TListNotes = ReturnType<typeof makeListNotes>;
