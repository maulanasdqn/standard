import type { TSearchControl } from "#/libs/forms/use-search-form.ts";
import { NEWSLETTER_MESSAGE } from "@app/messages";
import type {
	TNewsletterSort,
	TNewsletterSubscriberListInput,
} from "@app/schemas";
import { D } from "@mobily/ts-belt";
import {
	type UseMutationResult,
	type UseSuspenseQueryOptions,
	type UseSuspenseQueryResult,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { match } from "ts-pattern";
import { orpc } from "#/libs/orpc/client.ts";
import { useProcedureMutation } from "#/libs/orpc/procedure-mutation.ts";
import { suspenseQueryOptionsFor } from "#/libs/orpc/procedure-query.ts";
import type {
	TClientErrors,
	TClientInputs,
	TClientOutputs,
} from "#/libs/orpc/types.ts";
import type { TListChange } from "#/libs/table/list-patch.ts";

type TNewsletterIn = TClientInputs["newsletter"];
type TNewsletterOut = TClientOutputs["newsletter"];
type TNewsletterErr = TClientErrors["newsletter"];

const listRouteApi = getRouteApi("/_authenticated/subscribers/");

export const subscriberListOptions = (
	input: TNewsletterSubscriberListInput,
): UseSuspenseQueryOptions<TNewsletterOut["list"], TNewsletterErr["list"]> =>
	suspenseQueryOptionsFor(orpc.newsletter.list, input);

export const useSubscriberList = (): UseSuspenseQueryResult<
	TNewsletterOut["list"],
	TNewsletterErr["list"]
> => useSuspenseQuery(subscriberListOptions(listRouteApi.useSearch()));

export const useSubscriberSearch = (): TSearchControl => {
	const navigate = listRouteApi.useNavigate();
	const { search } = listRouteApi.useSearch();

	return {
		value: search ?? "",
		onChange: (next: string): void => {
			const value = match(next)
				.with("", () => undefined)
				.otherwise((text) => text);
			void navigate({
				search: (prev) => D.merge(prev, { search: value, page: 1 }),
			});
		},
	};
};

export const useSubscriberListChange = (): TListChange<TNewsletterSort> => {
	const navigate = listRouteApi.useNavigate();
	return (patch): void => {
		void navigate({ search: (prev) => D.merge(prev, patch) });
	};
};

export const useSubscriberDelete = (): UseMutationResult<
	TNewsletterOut["remove"],
	TNewsletterErr["remove"],
	TNewsletterIn["remove"]
> =>
	useProcedureMutation(orpc.newsletter.remove, {
		message: NEWSLETTER_MESSAGE.DELETED,
		invalidates: [orpc.newsletter.key()],
	});
