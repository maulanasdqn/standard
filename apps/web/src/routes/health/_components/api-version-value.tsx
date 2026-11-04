import { Skeleton } from "@app/components/ui/skeleton";
import { HEALTH_MESSAGE } from "@app/messages";
import type { FC, ReactElement } from "react";
import { match } from "ts-pattern";
import {
	HEALTH_VIEW_STATUS,
	type THealthViewStatus,
} from "#/routes/health/_constants/status.ts";

type TApiVersionValueProps = {
	status: THealthViewStatus;
	version: string | null;
};

export const ApiVersionValue: FC<TApiVersionValueProps> = (
	props,
): ReactElement =>
	match(props.status)
		.with(HEALTH_VIEW_STATUS.CHECKING, () => (
			<Skeleton className="inline-block h-4 w-16 align-middle" />
		))
		.otherwise(() => <>{props.version ?? HEALTH_MESSAGE.VERSION_UNKNOWN}</>);
