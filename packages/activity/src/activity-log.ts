import type { TActivityAction, TActivityResourceType } from "./actions.ts";

export type TActivityEntry = {
	actorId: string | null;
	action: TActivityAction;
	resourceType: TActivityResourceType;
	resourceId: string;
	metadata?: Record<string, unknown>;
};

export type TActivityRepo = {
	insert: (entry: TActivityEntry) => Promise<void>;
};
