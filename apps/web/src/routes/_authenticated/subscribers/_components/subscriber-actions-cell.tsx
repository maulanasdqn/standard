import { NEWSLETTER_MESSAGE } from "@app/messages";
import type { TNewsletterSubscriber } from "@app/schemas";
import type { FC, ReactElement } from "react";
import { RowActionsCell } from "#/routes/_authenticated/_components/row-actions-cell.tsx";
import { useSubscriberRowActions } from "#/routes/_authenticated/subscribers/_hooks/use-subscriber-row-actions.ts";

type TSubscriberActionsCellProps = {
	subscriber: TNewsletterSubscriber;
};

export const SubscriberActionsCell: FC<TSubscriberActionsCellProps> = (
	props,
): ReactElement => {
	const row = useSubscriberRowActions(props.subscriber);

	return (
		<RowActionsCell
			actions={row.actions}
			confirm={row.confirm}
			confirmTitle={NEWSLETTER_MESSAGE.DELETE_CONFIRM_TITLE}
			confirmDescription={NEWSLETTER_MESSAGE.DELETE_CONFIRM_DESCRIPTION}
		/>
	);
};
