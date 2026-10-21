import { searchQuerySchema } from "@app/schemas";
import { z } from "zod";
import {
	type TSearchControl,
	type TSearchForm,
	useSearchForm,
} from "#/libs/forms/use-search-form.ts";

const listSearchFormSchema = z.object({ search: searchQuerySchema.optional() });

export const useListSearchForm = (
	control: TSearchControl,
): TSearchForm<typeof listSearchFormSchema> =>
	useSearchForm(listSearchFormSchema, control);
