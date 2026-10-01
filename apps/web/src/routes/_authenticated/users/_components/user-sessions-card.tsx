import { Button } from "@app/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import { Skeleton } from "@app/components/ui/skeleton";
import { USER_MESSAGE } from "@app/messages";
import { A } from "@mobily/ts-belt";
import type { FC, ReactElement } from "react";
import { match } from "ts-pattern";
import { SessionItem } from "#/routes/_authenticated/_components/session-item.tsx";
import {
	useUserSessionRevoke,
	useUserSessions,
	useUserSessionsRevoke,
} from "#/routes/_authenticated/users/_hooks/use-user-admin.ts";

type TUserSessionsCardProps = {
	userId: string;
};

export const UserSessionsCard: FC<TUserSessionsCardProps> = (
	props,
): ReactElement => {
	const sessions = useUserSessions(props.userId);
	const revoke = useUserSessionRevoke();
	const revokeAll = useUserSessionsRevoke();
	const pending = revoke.isPending || revokeAll.isPending;
	const list = sessions.data ?? [];

	return (
		<Card>
			<CardHeader className="flex flex-row items-start justify-between gap-4">
				<div className="flex flex-col gap-1.5">
					<CardTitle>{USER_MESSAGE.SESSIONS_TITLE}</CardTitle>
					<CardDescription>{USER_MESSAGE.SESSIONS_DESCRIPTION}</CardDescription>
				</div>
				<Button
					variant="outline"
					size="sm"
					disabled={A.isEmpty(list) || pending}
					onClick={() => revokeAll.mutate({ id: props.userId })}
				>
					{USER_MESSAGE.SESSIONS_REVOKE_ALL}
				</Button>
			</CardHeader>
			<CardContent>
				{match({ loading: sessions.isLoading, empty: A.isEmpty(list) })
					.with({ loading: true }, () => <Skeleton className="h-14 w-full" />)
					.with({ empty: true }, () => (
						<p className="text-sm text-muted-foreground">
							{USER_MESSAGE.SESSIONS_EMPTY}
						</p>
					))
					.otherwise(() => (
						<ul className="divide-y">
							{A.map(list, (session) => (
								<SessionItem
									key={session.id}
									userAgent={session.userAgent}
									ipAddress={session.ipAddress}
									createdAt={session.createdAt}
									updatedAt={session.updatedAt}
									action={
										<Button
											variant="ghost"
											size="sm"
											disabled={pending}
											onClick={() =>
												revoke.mutate({
													id: props.userId,
													sessionId: session.id,
												})
											}
										>
											{USER_MESSAGE.SESSION_REVOKE}
										</Button>
									}
								/>
							))}
						</ul>
					))}
			</CardContent>
		</Card>
	);
};
