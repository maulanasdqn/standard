import { newsletterSubscriberListInputSchema } from "@app/schemas";
import {
	type TSearchForm,
	useSearchForm,
} from "#/libs/forms/use-search-form.ts";
import { useSubscriberSearch } from "#/routes/_authenticated/subscribers/_hooks/use-subscribers.ts";

const subscriberSearchFormSchema = newsletterSubscriberListInputSchema.pick({
	search: true,
});

export const useSubscriberSearchForm = (): TSearchForm<
	typeof subscriberSearchFormSchema
> => useSearchForm(subscriberSearchFormSchema, useSubscriberSearch());
