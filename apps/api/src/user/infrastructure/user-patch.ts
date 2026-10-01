import type { TUserUpdateInput } from "@app/schemas";
import { D } from "@mobily/ts-belt";
import { match, P } from "ts-pattern";

type TUserPatch = Omit<TUserUpdateInput, "id"> & { emailVerified?: boolean };

export const userPatchOf = (patch: Omit<TUserUpdateInput, "id">): TUserPatch =>
	match(patch.email)
		.with(
			P.string,
			(email): TUserPatch =>
				D.merge(patch, { email: email.toLowerCase(), emailVerified: false }),
		)
		.otherwise((): TUserPatch => patch);
