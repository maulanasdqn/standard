import type { TActivityRepo } from "@app/core";
import type { INoteRepo } from "#/domain/note/note.ts";

export type IDependencies = {
	noteRepo: INoteRepo;
	activityRepo: TActivityRepo;
};
