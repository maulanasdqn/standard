import { Input } from "@app/components/ui/input";
import type { FC, ReactElement } from "react";
import type { TSearchControl } from "#/libs/forms/use-search-form.ts";
import { useListSearchForm } from "#/routes/_authenticated/_hooks/use-list-search-form.ts";

export type TSearchBoxProps = {
	control: TSearchControl;
	placeholder: string;
	label: string;
};

export const SearchBox: FC<TSearchBoxProps> = (props): ReactElement => {
	const { form, onSubmit } = useListSearchForm(props.control);

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
