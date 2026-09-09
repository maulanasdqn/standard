import type { TNote, TUpdateNoteInput } from "@app/schemas";
import { NOTE_MESSAGE } from "@app/errors";
import { match } from "ts-pattern";
import { toNoteDto } from "#/application/note/to-note-dto.ts";
import { notFound } from "#/application/shared/errors.ts";
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
		const updated = await noteRepo.update(id, patch);
		const row = match(updated)
			.with(null, () => {
				throw notFound(NOTE_MESSAGE.NOT_FOUND);
			})
			.otherwise((found) => found);

		await activityRepo.insert({
			actorId,
			action: "note.update",
			entityType: "note",
			entityId: row.id,
		});

		return toNoteDto(row);
	};

export type TUpdateNote = ReturnType<typeof makeUpdateNote>;
