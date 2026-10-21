import { Badge } from "@app/components/ui/badge";
import { cn } from "@app/components/lib/utils";
import { NEWSLETTER_STATUS, type TNewsletterStatus } from "@app/schemas";
import type { FC, ReactElement } from "react";
import { match } from "ts-pattern";
import { subscriberStatusLabel } from "#/routes/_authenticated/subscribers/_utils/subscriber-labels.ts";

type TSubscriberStatusBadgeProps = {
	status: TNewsletterStatus;
};

const statusDot = (status: TNewsletterStatus): string =>
	match(status)
		.with(NEWSLETTER_STATUS.CONFIRMED, () => "bg-emerald-500")
		.with(NEWSLETTER_STATUS.PENDING, () => "bg-amber-500")
		.with(NEWSLETTER_STATUS.UNSUBSCRIBED, () => "bg-muted-foreground")
		.exhaustive();

export const SubscriberStatusBadge: FC<TSubscriberStatusBadgeProps> = (
	props,
): ReactElement => (
	<Badge variant="outline" className="gap-1.5 font-normal">
		<span className={cn("size-1.5 rounded-full", statusDot(props.status))} />
		{subscriberStatusLabel(props.status)}
	</Badge>
);
