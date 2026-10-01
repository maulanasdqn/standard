import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import { AUTH_MESSAGE } from "@app/messages";
import type { FC, ReactElement } from "react";
import { SessionItem } from "#/routes/_authenticated/_components/session-item.tsx";
import type { TOwnSession } from "#/routes/_authenticated/account/_hooks/use-own-sessions.ts";

type TSessionRowProps = {
	session: TOwnSession;
	pending: boolean;
	onRevoke: (token: string) => void;
};

export const SessionRow: FC<TSessionRowProps> = (props): ReactElement => (
	<SessionItem
		userAgent={props.session.userAgent}
		ipAddress={props.session.ipAddress}
		createdAt={props.session.createdAt}
		updatedAt={props.session.updatedAt}
		badge={
			props.session.current && (
				<Badge variant="outline">{AUTH_MESSAGE.SESSION_THIS_DEVICE}</Badge>
			)
		}
		action={
			!props.session.current && (
				<Button
					variant="ghost"
					size="sm"
					disabled={props.pending}
					onClick={() => props.onRevoke(props.session.token)}
				>
					{AUTH_MESSAGE.SESSION_REVOKE}
				</Button>
			)
		}
	/>
);
