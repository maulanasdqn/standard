import type { TNoteIdInput } from "@app/schemas";
import { NOTE_MESSAGE } from "@app/errors";
import { notFound } from "#/application/shared/errors.ts";
import type { IDependencies } from "#/application/use-cases-deps.ts";

export const makeDeleteNote =
	({
		noteRepo,
		activityRepo,
	}: Pick<IDependencies, "noteRepo" | "activityRepo">) =>
	async ({ id }: TNoteIdInput, actorId: string): Promise<{ id: string }> => {
		const removed = await noteRepo.remove(id);
		if (!removed) {
			throw notFound(NOTE_MESSAGE.NOT_FOUND);
		}
		await activityRepo.insert({
			actorId,
			action: "note.delete",
			entityType: "note",
			entityId: id,
		});
		return { id };
	};

export type TDeleteNote = ReturnType<typeof makeDeleteNote>;
