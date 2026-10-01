import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import { formatDateTime } from "@app/format";
import { AUTH_MESSAGE } from "@app/messages";
import { Monitor, Smartphone } from "lucide-react";
import type { FC, ReactElement } from "react";
import { DEVICE_KIND, deviceKindOf } from "#/libs/auth/device.ts";
import type { TOwnSession } from "#/routes/_authenticated/account/_hooks/use-own-sessions.ts";

type TSessionRowProps = {
	session: TOwnSession;
	pending: boolean;
	onRevoke: (token: string) => void;
};

export const SessionRow: FC<TSessionRowProps> = (props): ReactElement => {
	const mobile = deviceKindOf(props.session.userAgent) === DEVICE_KIND.MOBILE;
	const Icon = mobile ? Smartphone : Monitor;

	return (
		<li className="flex items-center gap-4 py-3">
			<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
				<Icon className="size-4" />
			</div>
			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<div className="flex items-center gap-2">
					<span
						className="truncate text-sm font-medium"
						title={props.session.userAgent ?? undefined}
					>
						{mobile
							? AUTH_MESSAGE.SESSION_MOBILE
							: AUTH_MESSAGE.SESSION_DESKTOP}
					</span>
					{props.session.current && (
						<Badge variant="outline">{AUTH_MESSAGE.SESSION_THIS_DEVICE}</Badge>
					)}
				</div>
				<span className="truncate text-xs text-muted-foreground">
					{props.session.ipAddress ?? AUTH_MESSAGE.SESSION_ADDRESS_UNKNOWN}
					{" · "}
					{AUTH_MESSAGE.SESSION_SIGNED_IN}{" "}
					{formatDateTime(props.session.createdAt)}
					{" · "}
					{AUTH_MESSAGE.SESSION_LAST_ACTIVE}{" "}
					{formatDateTime(props.session.updatedAt)}
				</span>
			</div>
			{!props.session.current && (
				<Button
					variant="ghost"
					size="sm"
					disabled={props.pending}
					onClick={() => props.onRevoke(props.session.token)}
				>
					{AUTH_MESSAGE.SESSION_REVOKE}
				</Button>
			)}
		</li>
	);
};
