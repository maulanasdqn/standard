import { Input } from "@app/components/ui/input";
import type { ReactElement } from "react";
import { useUserSearch } from "#/routes/_authenticated/users/_hooks/use-users.ts";

export const UserSearch = (): ReactElement => {
	const { value, onChange } = useUserSearch();

	return (
		<Input
			type="search"
			placeholder="Search by name or email"
			aria-label="Search users"
			value={value}
			onChange={(event) => onChange(event.target.value)}
			className="max-w-sm"
		/>
	);
};
