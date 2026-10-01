import type {
	TUserCreateInput,
	TUserInviteInput,
	TUserListInput,
	TUserPasswordResetInput,
	TUserUpdateInput,
} from "@app/schemas";
import { Context, type Effect } from "effect";
import type { TBaseRow } from "#/shared/base-row.ts";
import type { EAuth, EConflict, EDatabase } from "#/shared/errors.ts";
import type { TRowPage } from "#/shared/pagination.ts";
import type { TServiceId } from "#/shared/service-id.ts";
import { REPO_TAG } from "#/shared/repo-tags.ts";

export type TUserRow = TBaseRow & {
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	role: string;
	deactivatedAt: Date | null;
	twoFactorEnabled: boolean | null;
};

export type TUserSessionRow = {
	id: string;
	ipAddress: string | null;
	userAgent: string | null;
	createdAt: Date;
	updatedAt: Date;
	expiresAt: Date;
};

export type TUserRepo = {
	list: (input: TUserListInput) => Effect.Effect<TRowPage<TUserRow>, EDatabase>;
	findById: (id: string) => Effect.Effect<TUserRow | null, EDatabase>;
	findByEmail: (email: string) => Effect.Effect<TUserRow | null, EDatabase>;
	create: (
		input: TUserCreateInput,
	) => Effect.Effect<TUserRow, EAuth | EConflict>;
	update: (
		input: TUserUpdateInput,
	) => Effect.Effect<TUserRow | null, EDatabase | EConflict>;
	remove: (id: string) => Effect.Effect<boolean, EDatabase>;
	resetPassword: (input: TUserPasswordResetInput) => Effect.Effect<void, EAuth>;
	invite: (
		input: TUserInviteInput,
	) => Effect.Effect<TUserRow, EAuth | EConflict>;
	deactivate: (id: string) => Effect.Effect<TUserRow | null, EDatabase>;
	reactivate: (id: string) => Effect.Effect<TUserRow | null, EDatabase>;
	sessions: (
		userId: string,
	) => Effect.Effect<readonly TUserSessionRow[], EDatabase>;
	sessionRevoke: (
		userId: string,
		sessionId: string,
	) => Effect.Effect<boolean, EDatabase>;
	sessionsRevoke: (userId: string) => Effect.Effect<void, EDatabase>;
	twoFactorReset: (id: string) => Effect.Effect<TUserRow | null, EDatabase>;
};

export type TUserRepoId = TServiceId<typeof REPO_TAG.USER>;

export const UserRepo = Context.Service<TUserRepoId, TUserRepo>(REPO_TAG.USER);
