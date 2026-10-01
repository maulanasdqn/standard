import { formatDateTime } from "@app/format";
import { AUTH_MESSAGE } from "@app/messages";
import { Monitor, Smartphone } from "lucide-react";
import type { FC, ReactElement, ReactNode } from "react";
import { DEVICE_KIND, deviceKindOf } from "#/libs/auth/device.ts";

type TSessionItemProps = {
	userAgent: string | null;
	ipAddress: string | null;
	createdAt: Date | string;
	updatedAt: Date | string;
	badge?: ReactNode;
	action?: ReactNode;
};

export const SessionItem: FC<TSessionItemProps> = (props): ReactElement => {
	const mobile = deviceKindOf(props.userAgent) === DEVICE_KIND.MOBILE;
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
						title={props.userAgent ?? undefined}
					>
						{mobile
							? AUTH_MESSAGE.SESSION_MOBILE
							: AUTH_MESSAGE.SESSION_DESKTOP}
					</span>
					{props.badge}
				</div>
				<span className="truncate text-xs text-muted-foreground">
					{props.ipAddress ?? AUTH_MESSAGE.SESSION_ADDRESS_UNKNOWN}
					{" · "}
					{AUTH_MESSAGE.SESSION_SIGNED_IN} {formatDateTime(props.createdAt)}
					{" · "}
					{AUTH_MESSAGE.SESSION_LAST_ACTIVE} {formatDateTime(props.updatedAt)}
				</span>
			</div>
			{props.action}
		</li>
	);
};
