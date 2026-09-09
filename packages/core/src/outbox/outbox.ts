import { A, D } from "@mobily/ts-belt";
import { match, P } from "ts-pattern";

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

export const drainOutbox = async (
	repo: TOutboxRepo,
	handlers: Record<string, TOutboxHandler>,
	batchSize = 20,
): Promise<number> => {
	const events = await repo.claimPending(batchSize);

	for (const event of events) {
		const handler = D.get(handlers, event.type);
		await match(handler)
			.with(P.nonNullable, (run) => run(event))
			.otherwise(() => Promise.resolve());
		await repo.markProcessed(event.id);
	}

	return A.length(events);
};
