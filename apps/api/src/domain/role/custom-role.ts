import type { TPermission } from "@app/permissions";
import type { TRoleCreateInput, TRoleUpdateInput } from "@app/schemas";
import { Context, type Effect } from "effect";
import type { EDatabase } from "#/domain/shared/errors.ts";
import { REPO_TAG } from "#/domain/shared/service-tags.ts";

export type TCustomRoleRow = {
	id: string;
	key: string;
	label: string;
	description: string | null;
	permissions: readonly TPermission[];
	createdBy: string | null;
	createdAt: Date;
	updatedAt: Date;
};

export type TCustomRoleRepo = {
	list: () => Effect.Effect<TCustomRoleRow[], EDatabase>;
	findByKey: (key: string) => Effect.Effect<TCustomRoleRow | null, EDatabase>;
	create: (
		input: TRoleCreateInput,
		createdBy: string,
	) => Effect.Effect<TCustomRoleRow, EDatabase>;
	update: (
		input: TRoleUpdateInput,
	) => Effect.Effect<TCustomRoleRow | null, EDatabase>;
	remove: (key: string) => Effect.Effect<boolean, EDatabase>;
};

export class CustomRoleRepo extends Context.Service<
	CustomRoleRepo,
	TCustomRoleRepo
>()(REPO_TAG.CUSTOM_ROLE) {}
