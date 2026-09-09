export type TActivityEntry = {
	actorId: string | null;
	action: string;
	entityType: string;
	entityId: string;
	metadata?: Record<string, unknown>;
};

export type TActivityRepo = {
	insert: (entry: TActivityEntry) => Promise<void>;
};
