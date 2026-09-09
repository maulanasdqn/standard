import type { TNote, TNoteIdInput } from "@app/schemas";
import { NOTE_MESSAGE } from "@app/errors";
import { match } from "ts-pattern";
import { toNoteDto } from "#/application/note/to-note-dto.ts";
import { notFound } from "#/application/shared/errors.ts";
import type { IDependencies } from "#/application/use-cases-deps.ts";

export const makeGetNote =
	({ noteRepo }: Pick<IDependencies, "noteRepo">) =>
	async ({ id }: TNoteIdInput): Promise<TNote> => {
		const row = await noteRepo.findById(id);
		return match(row)
			.with(null, () => {
				throw notFound(NOTE_MESSAGE.NOT_FOUND);
			})
			.otherwise((found) => toNoteDto(found));
	};

export type TGetNote = ReturnType<typeof makeGetNote>;
