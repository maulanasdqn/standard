import { Context, type Effect } from "effect";
import type { TServiceId } from "#/shared/service-id.ts";
import { REPO_TAG } from "#/shared/repo-tags.ts";
import type { TUserRow } from "#/user/domain/user.ts";

export type TUserNotifier = {
	invite: (user: TUserRow) => Effect.Effect<void>;
	deactivated: (user: TUserRow) => Effect.Effect<void>;
	emailVerify: (user: TUserRow) => Effect.Effect<void>;
	twoFactorReset: (user: TUserRow) => Effect.Effect<void>;
};

export type TUserNotifierId = TServiceId<typeof REPO_TAG.USER_NOTIFIER>;

export const UserNotifier = Context.Service<TUserNotifierId, TUserNotifier>(
	REPO_TAG.USER_NOTIFIER,
);
