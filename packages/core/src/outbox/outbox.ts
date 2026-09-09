export type TOutboxEvent = {
	id: string;
	type: string;
	payload: unknown;
	createdAt: Date;
	processedAt: Date | null;
};

export type TOutboxRepo = {
	insert: (type: string, payload: unknown) => Promise<void>;
	claimPending: (limit: number) => Promise<TOutboxEvent[]>;
	markProcessed: (id: string) => Promise<void>;
};

export type TOutboxHandler = (event: TOutboxEvent) => Promise<void>;

/**
 * Drains pending outbox events through the registered handlers.
 * Call on an interval from the worker process.
 */
export const drainOutbox = async (
	repo: TOutboxRepo,
	handlers: Record<string, TOutboxHandler>,
	batchSize = 20,
): Promise<number> => {
	const events = await repo.claimPending(batchSize);
	for (const event of events) {
		const handler = handlers[event.type];
		if (handler) {
			await handler(event);
		}
		await repo.markProcessed(event.id);
	}
	return events.length;
};
