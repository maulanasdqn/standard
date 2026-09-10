import { A } from "@mobily/ts-belt";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "#/libs/orpc/client.ts";

export type TRoleOption = {
	value: string;
	label: string;
};

export const useRoleOptions = (): readonly TRoleOption[] => {
	const { data } = useQuery(
		orpc.role.list.queryOptions({ queryKey: orpc.role.list.queryKey() }),
	);

	return A.map(data?.items ?? [], (role) => ({
		value: role.key,
		label: role.label,
	}));
};
