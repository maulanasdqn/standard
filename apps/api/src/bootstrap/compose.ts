import { Layer, ManagedRuntime } from "effect";
import { AuthService } from "#/infrastructure/auth/auth-service.ts";
import { CacheService } from "#/infrastructure/cache/redis.ts";
import { DbService } from "#/infrastructure/db/db-service.ts";
import { ActivityRepo } from "#/infrastructure/db/repositories/activity-repository.ts";
import { NoteRepo } from "#/infrastructure/db/repositories/note-repository.ts";
import { QueueService } from "#/infrastructure/queue/rabbitmq.ts";

export const AppLayer = Layer.mergeAll(
	DbService.layer,
	NoteRepo.layer,
	ActivityRepo.layer,
	AuthService.layer,
	CacheService.layer,
	QueueService.layer,
);

export const appMemoMap = Layer.makeMemoMapUnsafe();

export const runtime = ManagedRuntime.make(AppLayer, { memoMap: appMemoMap });

export type TAppRuntimeServices =
	| DbService
	| NoteRepo
	| ActivityRepo
	| AuthService
	| CacheService
	| QueueService;
