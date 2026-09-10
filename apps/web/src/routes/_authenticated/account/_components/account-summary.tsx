import { roleLabel } from "@app/permissions";
import type { ReactElement } from "react";
import { match, P } from "ts-pattern";
import { useSession } from "#/libs/auth/use-session.ts";

export const AccountSummary = (): ReactElement =>
	match(useSession())
		.with(P.nullish, () => (
			<p className="text-sm text-neutral-500">Not signed in.</p>
		))
		.otherwise((session) => (
			<dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border border-neutral-200 p-4 text-sm">
				<dt className="text-neutral-500">Name</dt>
				<dd>{session.user.name}</dd>
				<dt className="text-neutral-500">Email</dt>
				<dd>{session.user.email}</dd>
				<dt className="text-neutral-500">Role</dt>
				<dd>{roleLabel(session.user.role)}</dd>
			</dl>
		));
