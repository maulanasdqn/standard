import { Input } from "@app/components/ui/input";
import { searchQuerySchema } from "@app/schemas";
import type { FC, ReactElement } from "react";
import { z } from "zod";
import {
	type TSearchControl,
	useSearchForm,
} from "#/libs/forms/use-search-form.ts";

export type TSearchBoxProps = {
	control: TSearchControl;
	placeholder: string;
	label: string;
};

const searchBoxSchema = z.object({ search: searchQuerySchema.optional() });

export const SearchBox: FC<TSearchBoxProps> = (props): ReactElement => {
	const { form, onSubmit } = useSearchForm(searchBoxSchema, props.control);

	return (
		<form onSubmit={onSubmit} className="max-w-sm">
			<form.Field name="search">
				{(field) => (
					<Input
						type="search"
						placeholder={props.placeholder}
						aria-label={props.label}
						value={field.state.value ?? ""}
						onBlur={field.handleBlur}
						onChange={(event) => field.handleChange(event.target.value)}
					/>
				)}
			</form.Field>
		</form>
	);
};
