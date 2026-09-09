import type { TNote, TNoteIdInput } from "@app/schemas";
import { NOTE_MESSAGE } from "@app/errors";
import { notFound } from "#/application/shared/errors.ts";
import { toNoteDto } from "#/application/note/to-note-dto.ts";
import type { IDependencies } from "#/application/use-cases-deps.ts";

export const makeGetNote =
	({ noteRepo }: Pick<IDependencies, "noteRepo">) =>
	async ({ id }: TNoteIdInput): Promise<TNote> => {
		const row = await noteRepo.findById(id);
		if (!row) {
			throw notFound(NOTE_MESSAGE.NOT_FOUND);
		}
		return toNoteDto(row);
	};

export type TGetNote = ReturnType<typeof makeGetNote>;
