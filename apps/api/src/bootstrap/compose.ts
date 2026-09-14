import { Layer, ManagedRuntime } from "effect";
import type { TActivityRepoId } from "#/domain/activity/activity.ts";
import type { TNoteRepoId } from "#/domain/note/note.ts";
import type { TCustomRoleRepoId } from "#/domain/role/custom-role.ts";
import type { TUserRepoId } from "#/domain/user/user.ts";
import {
	authServiceLayer,
	type TAuthServiceId,
} from "#/infrastructure/auth/auth-service.ts";
import {
	cacheServiceLayer,
	type TCacheServiceId,
} from "#/infrastructure/cache/redis.ts";
import {
	dbServiceLayer,
	type TDbServiceId,
} from "#/infrastructure/db/db-service.ts";
import { activityRepoLayer } from "#/infrastructure/db/repositories/activity-repository.ts";
import { customRoleRepoLayer } from "#/infrastructure/db/repositories/custom-role-repository.ts";
import { noteRepoLayer } from "#/infrastructure/db/repositories/note-repository.ts";
import { userRepoLayer } from "#/infrastructure/db/repositories/user-repository.ts";
import {
	mailServiceLayer,
	type TMailServiceId,
} from "#/infrastructure/mail/mailer.ts";
import {
	queueServiceLayer,
	type TQueueServiceId,
} from "#/infrastructure/queue/rabbitmq.ts";

export const AppLayer = Layer.mergeAll(
	dbServiceLayer,
	noteRepoLayer,
	userRepoLayer,
	customRoleRepoLayer,
	activityRepoLayer,
	authServiceLayer,
	cacheServiceLayer,
	queueServiceLayer,
	mailServiceLayer,
);

export const appMemoMap = Layer.makeMemoMapUnsafe();

export const runtime = ManagedRuntime.make(AppLayer, { memoMap: appMemoMap });

export type TAppRuntime = typeof runtime;

export type TAppRuntimeServices =
	| TDbServiceId
	| TNoteRepoId
	| TUserRepoId
	| TCustomRoleRepoId
	| TActivityRepoId
	| TAuthServiceId
	| TCacheServiceId
	| TQueueServiceId
	| TMailServiceId;
