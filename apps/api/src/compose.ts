import { buildUseCases } from "#/application/use-cases.ts";
import { env } from "#/infrastructure/config/env.ts";
import { createCache } from "#/infrastructure/cache/redis.ts";
import { createAuth } from "#/infrastructure/auth/better-auth.ts";
import { createAuthService } from "#/infrastructure/auth/auth-service.ts";
import { createDb } from "#/infrastructure/db/client.ts";
import { createActivityRepository } from "#/infrastructure/db/repositories/activity-repository.ts";
import { createNoteRepository } from "#/infrastructure/db/repositories/note-repository.ts";

/** The single composition root: builds every infrastructure adapter and wires it into the use cases. */
export const compose = () => {
	const db = createDb(env.DATABASE_URL);
	const cache = createCache(env.REDIS_URL);

	const activityRepo = createActivityRepository(db);
	const noteRepo = createNoteRepository(db);

	const auth = createAuth({ db, activityRepo });
	const authService = createAuthService(auth);

	const useCases = buildUseCases({ noteRepo, activityRepo });

	return { db, cache, auth, authService, useCases, activityRepo, noteRepo };
};

export type TComposed = ReturnType<typeof compose>;
