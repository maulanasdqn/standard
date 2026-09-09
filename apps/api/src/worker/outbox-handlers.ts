import type { TOutboxHandler } from "@app/core";

/** Registry of outbox event type -> handler, drained on an interval by the worker. */
export const outboxHandlers: Record<string, TOutboxHandler> = {};
