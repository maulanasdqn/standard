import type { TCreateNoteInput, TNote } from "@app/schemas";
import { toNoteDto } from "#/application/note/to-note-dto.ts";
import type { IDependencies } from "#/application/use-cases-deps.ts";

export const makeCreateNote =
	({
		noteRepo,
		activityRepo,
	}: Pick<IDependencies, "noteRepo" | "activityRepo">) =>
	async (input: TCreateNoteInput, authorId: string): Promise<TNote> => {
		const row = await noteRepo.create({ ...input, authorId });
		await activityRepo.insert({
			actorId: authorId,
			action: "note.create",
			entityType: "note",
			entityId: row.id,
		});
		return toNoteDto(row);
	};

export type TCreateNote = ReturnType<typeof makeCreateNote>;
