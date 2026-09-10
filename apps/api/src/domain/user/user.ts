import type {
	TUserCreateInput,
	TUserListInput,
	TUserUpdateInput,
} from "@app/schemas";
import type { Effect } from "effect";
import type { EAuth, EDatabase } from "#/application/shared/errors.ts";
import type { TRowPage } from "#/domain/shared/pagination.ts";

export type TUserRow = {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	role: string;
	createdAt: Date;
	updatedAt: Date;
};

export type TRoleMemberCounts = Readonly<Record<string, number>>;

export type TUserRepo = {
	list: (input: TUserListInput) => Effect.Effect<TRowPage<TUserRow>, EDatabase>;
	findById: (id: string) => Effect.Effect<TUserRow | null, EDatabase>;
	findByEmail: (email: string) => Effect.Effect<TUserRow | null, EDatabase>;
	create: (input: TUserCreateInput) => Effect.Effect<TUserRow, EAuth>;
	update: (
		input: TUserUpdateInput,
	) => Effect.Effect<TUserRow | null, EDatabase>;
	remove: (id: string) => Effect.Effect<boolean, EDatabase>;
	countByRole: () => Effect.Effect<TRoleMemberCounts, EDatabase>;
};
