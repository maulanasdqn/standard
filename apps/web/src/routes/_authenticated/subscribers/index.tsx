import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { NEWSLETTER_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { newsletterSubscriberListInputSchema } from "@app/schemas";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { searchLenient } from "#/libs/table/search-lenient.ts";
import { SubscriberTable } from "#/routes/_authenticated/subscribers/_components/subscriber-table.tsx";
import {
	subscriberListOptions,
	useSubscriberList,
	useSubscriberListChange,
} from "#/routes/_authenticated/subscribers/_hooks/use-subscribers.ts";
import { ListPageSkeleton } from "#/routes/_components/list-page-skeleton.tsx";

const subscriberSearchValidate = searchLenient(
	newsletterSubscriberListInputSchema,
);

const SubscribersPage: FC = (): ReactElement => {
	const { data } = useSubscriberList();
	const search = Route.useSearch();
	const onChange = useSubscriberListChange();

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-xl font-semibold">{NEWSLETTER_MESSAGE.TITLE}</h1>
				<p className="text-sm text-muted-foreground">
					{NEWSLETTER_MESSAGE.DESCRIPTION}
				</p>
			</div>
			<SubscriberTable
				list={data}
				sortBy={search.sortBy}
				sortDir={search.sortDir}
				onChange={onChange}
			/>
		</div>
	);
};

const SubscribersPending: FC = (): ReactElement => (
	<ListPageSkeleton columns={5} />
);

export const Route = createFileRoute("/_authenticated/subscribers/")({
	validateSearch: subscriberSearchValidate,
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.NEWSLETTER_READ],
	}),
	loaderDeps: ({ search }) => ({ search }),
	loader: ({ context, deps }) =>
		context.queryClient.ensureQueryData(subscriberListOptions(deps.search)),
	component: SubscribersPage,
	pendingComponent: SubscribersPending,
});
