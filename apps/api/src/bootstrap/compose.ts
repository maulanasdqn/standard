import type { TActivityRepo } from "@app/core";
import type { Channel } from "amqplib";
import type { Redis } from "ioredis";
import { buildUseCases, type TUseCases } from "#/application/use-cases.ts";
import type { INoteRepo } from "#/domain/note/note.ts";
import type { IAuthService } from "#/domain/ports/auth-service.ts";
import { createAuthService } from "#/infrastructure/auth/auth-service.ts";
import { createAuth, type TAuth } from "#/infrastructure/auth/better-auth.ts";
import { createCache } from "#/infrastructure/cache/redis.ts";
import { env } from "#/infrastructure/config/env.ts";
import { createDb, type TDb } from "#/infrastructure/db/client.ts";
import { createActivityRepository } from "#/infrastructure/db/repositories/activity-repository.ts";
import { createNoteRepository } from "#/infrastructure/db/repositories/note-repository.ts";
import { createQueueConnection } from "#/infrastructure/queue/rabbitmq.ts";

export type TComposed = {
	db: TDb;
	cache: Redis;
	queueChannel: Channel;
	auth: TAuth;
	authService: IAuthService;
	useCases: TUseCases;
	activityRepo: TActivityRepo;
	noteRepo: INoteRepo;
};

export const compose = async (): Promise<TComposed> => {
	const db = createDb(env.DATABASE_URL);
	const cache = createCache(env.REDIS_URL);
	const { channel: queueChannel } = await createQueueConnection(
		env.RABBITMQ_URL,
	);

	const activityRepo = createActivityRepository(db);
	const noteRepo = createNoteRepository(db);

	const auth = createAuth({ db, activityRepo });
	const authService = createAuthService(auth);

	const useCases = buildUseCases({ noteRepo, activityRepo });

	return {
		db,
		cache,
		queueChannel,
		auth,
		authService,
		useCases,
		activityRepo,
		noteRepo,
	};
};
