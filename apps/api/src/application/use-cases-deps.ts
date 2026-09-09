import type { TActivityRepo } from "@app/core";
import type { INoteRepo } from "#/domain/note/note.ts";

/** Every port the application layer depends on. `compose.ts` supplies concrete implementations. */
export type IDependencies = {
	noteRepo: INoteRepo;
	activityRepo: TActivityRepo;
};
