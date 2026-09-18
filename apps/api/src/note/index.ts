import { Layer } from "effect";
import { noteAttachmentSweep } from "#/note/application/note-attachment-sweep.ts";
import { noteAttachmentRepoLayer } from "#/note/infrastructure/note-attachment-repository.ts";
import { noteAttachmentStoreLayer } from "#/note/infrastructure/note-attachment-store.ts";
import { noteRepoLayer } from "#/note/infrastructure/note-repository.ts";
import { noteRouterBuild } from "#/note/presentation/note-router.ts";

const noteLayer = Layer.mergeAll(
	noteRepoLayer,
	noteAttachmentRepoLayer,
	noteAttachmentStoreLayer,
);

export const noteModule: {
	layer: typeof noteLayer;
	routerBuild: typeof noteRouterBuild;
	attachmentSweep: typeof noteAttachmentSweep;
} = {
	layer: noteLayer,
	routerBuild: noteRouterBuild,
	attachmentSweep: noteAttachmentSweep,
};
