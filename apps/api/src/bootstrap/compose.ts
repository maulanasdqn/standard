import { Layer, ManagedRuntime } from "effect";
import type { ActivityRepo } from "#/domain/activity/activity.ts";
import type { NoteRepo } from "#/domain/note/note.ts";
import type { CustomRoleRepo } from "#/domain/role/custom-role.ts";
import type { UserRepo } from "#/domain/user/user.ts";
import { AuthService } from "#/infrastructure/auth/auth-service.ts";
import { CacheService } from "#/infrastructure/cache/redis.ts";
import { DbService } from "#/infrastructure/db/db-service.ts";
import { activityRepoLayer } from "#/infrastructure/db/repositories/activity-repository.ts";
import { customRoleRepoLayer } from "#/infrastructure/db/repositories/custom-role-repository.ts";
import { noteRepoLayer } from "#/infrastructure/db/repositories/note-repository.ts";
import { userRepoLayer } from "#/infrastructure/db/repositories/user-repository.ts";
import { MailService } from "#/infrastructure/mail/mailer.ts";
import { QueueService } from "#/infrastructure/queue/rabbitmq.ts";

export const AppLayer = Layer.mergeAll(
	DbService.layer,
	noteRepoLayer,
	userRepoLayer,
	customRoleRepoLayer,
	activityRepoLayer,
	AuthService.layer,
	CacheService.layer,
	QueueService.layer,
	MailService.layer,
);

export const appMemoMap = Layer.makeMemoMapUnsafe();

export const runtime = ManagedRuntime.make(AppLayer, { memoMap: appMemoMap });

export type TAppRuntime = typeof runtime;

export type TAppRuntimeServices =
	| DbService
	| NoteRepo
	| UserRepo
	| CustomRoleRepo
	| ActivityRepo
	| AuthService
	| CacheService
	| QueueService
	| MailService;
