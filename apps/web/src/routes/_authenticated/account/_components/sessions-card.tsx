import { Button } from "@app/components/ui/button";
import { Card, CardContent, CardHeader } from "@app/components/ui/card";
import { CardHeading } from "@app/components/ui/card-heading";
import { Skeleton } from "@app/components/ui/skeleton";
import { AUTH_MESSAGE } from "@app/messages";
import { A } from "@mobily/ts-belt";
import type { FC, ReactElement } from "react";
import { match } from "ts-pattern";
import { SessionRow } from "#/routes/_authenticated/account/_components/session-row.tsx";
import { useOwnSessions } from "#/routes/_authenticated/account/_hooks/use-own-sessions.ts";

const SESSIONS_STATE = {
	LOADING: "loading",
	ERROR: "error",
	READY: "ready",
} as const;

export const SessionsCard: FC = (): ReactElement => {
	const own = useOwnSessions();
	const state = match(own)
		.with({ isLoading: true }, () => SESSIONS_STATE.LOADING)
		.with({ isError: true }, () => SESSIONS_STATE.ERROR)
		.otherwise(() => SESSIONS_STATE.READY);

	return (
		<Card>
			<CardHeader className="flex flex-row items-start justify-between gap-4">
				<div className="flex flex-col gap-1.5">
					<CardHeading info={AUTH_MESSAGE.SESSIONS_DESCRIPTION}>
						{AUTH_MESSAGE.SESSIONS_TITLE}
					</CardHeading>
				</div>
				<Button
					variant="outline"
					size="sm"
					disabled={!own.hasOthers || own.pending}
					pending={own.revokingOthers}
					onClick={own.revokeOthers}
				>
					{AUTH_MESSAGE.SESSION_REVOKE_OTHERS}
				</Button>
			</CardHeader>
			<CardContent>
				{match(state)
					.with(SESSIONS_STATE.LOADING, () => (
						<Skeleton className="h-14 w-full" />
					))
					.with(SESSIONS_STATE.ERROR, () => (
						<p className="text-sm text-destructive">
							{AUTH_MESSAGE.SESSIONS_LOAD_FAILED}
						</p>
					))
					.with(SESSIONS_STATE.READY, () => (
						<ul className="divide-y">
							{A.map(own.sessions, (session) => (
								<SessionRow
									key={session.id}
									session={session}
									disabled={own.pending}
									pending={own.revokingToken === session.token}
									onRevoke={own.revoke}
								/>
							))}
						</ul>
					))
					.exhaustive()}
			</CardContent>
		</Card>
	);
};
