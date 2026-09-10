export type TActivityRow = {
	id: string;
	actorId: string | null;
	actorEmail: string | null;
	action: string;
	entityType: string;
	entityId: string;
	metadata: unknown;
	createdAt: Date;
};
