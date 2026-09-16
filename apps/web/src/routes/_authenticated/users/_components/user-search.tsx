import { Input } from "@app/components/ui/input";
import type { FC, ReactElement } from "react";
import { useUserSearchForm } from "#/routes/_authenticated/users/_hooks/use-user-search-form.ts";

export const UserSearch: FC = (): ReactElement => {
	const { form, onSubmit } = useUserSearchForm();

	return (
		<form onSubmit={onSubmit} className="max-w-sm">
			<form.Field name="search">
				{(field) => (
					<Input
						type="search"
						placeholder="Search by name or email"
						aria-label="Search users"
						value={field.state.value ?? ""}
						onBlur={field.handleBlur}
						onChange={(event) => field.handleChange(event.target.value)}
					/>
				)}
			</form.Field>
		</form>
	);
};
