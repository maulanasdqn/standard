import type { TNote, TUpdateNoteInput } from "@app/schemas";
import { NOTE_MESSAGE } from "@app/errors";
import { notFound } from "#/application/shared/errors.ts";
import { toNoteDto } from "#/application/note/to-note-dto.ts";
import type { IDependencies } from "#/application/use-cases-deps.ts";

export const makeUpdateNote =
	({
		noteRepo,
		activityRepo,
	}: Pick<IDependencies, "noteRepo" | "activityRepo">) =>
	async (
		{ id, ...patch }: TUpdateNoteInput,
		actorId: string,
	): Promise<TNote> => {
		const row = await noteRepo.update(id, patch);
		if (!row) {
			throw notFound(NOTE_MESSAGE.NOT_FOUND);
		}
		await activityRepo.insert({
			actorId,
			action: "note.update",
			entityType: "note",
			entityId: row.id,
		});
		return toNoteDto(row);
	};

export type TUpdateNote = ReturnType<typeof makeUpdateNote>;
