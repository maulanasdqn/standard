import { APP_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import type { TNewsletterSubscriber } from "@app/schemas";
import { Trash2 } from "lucide-react";
import {
	ROW_ACTION,
	type TRowAction,
} from "#/routes/_authenticated/_constants/row-action.ts";
import type { TConfirmedAction } from "#/routes/_authenticated/_hooks/use-confirmed-action.ts";
import { useRowDeleteConfirm } from "#/routes/_authenticated/_hooks/use-row-delete-confirm.ts";
import { useSubscriberDelete } from "#/routes/_authenticated/subscribers/_hooks/use-subscribers.ts";

export type TSubscriberRowActions = {
	actions: readonly TRowAction[];
	confirm: TConfirmedAction<void>;
};

export const useSubscriberRowActions = (
	subscriber: TNewsletterSubscriber,
): TSubscriberRowActions => {
	const subscriberDelete = useSubscriberDelete();
	const confirm = useRowDeleteConfirm(() =>
		subscriberDelete.mutate({ id: subscriber.id }),
	);

	return {
		confirm,
		actions: [
			{
				id: ROW_ACTION.DELETE,
				label: APP_MESSAGE.DELETE,
				icon: Trash2,
				permissions: [PERMISSION.NEWSLETTER_DELETE],
				destructive: true,
				disabled: subscriberDelete.isPending,
				onSelect: (): void => confirm.request(),
			},
		],
	};
};
