import {
	type QueryClient,
	type UseMutationResult,
	type UseQueryResult,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { orpc } from "#/libs/orpc/client.ts";
import { toastError } from "#/libs/orpc/toast-error.ts";
import type {
	TClientErrors,
	TClientInputs,
	TClientOutputs,
} from "#/libs/orpc/types.ts";

type TRoleIn = TClientInputs["role"];
type TRoleOut = TClientOutputs["role"];
type TRoleErr = TClientErrors["role"];

const editRouteApi = getRouteApi("/_authenticated/roles/$key");

const invalidateRoles = (queryClient: QueryClient): void => {
	void queryClient.invalidateQueries({ queryKey: orpc.role.key() });
};

export const useRoleList = (): UseQueryResult<
	TRoleOut["list"],
	TRoleErr["list"]
> =>
	useQuery(
		orpc.role.list.queryOptions({ queryKey: orpc.role.list.queryKey() }),
	);

export const useRoleGet = (): UseQueryResult<
	TRoleOut["get"],
	TRoleErr["get"]
> => {
	const { key } = editRouteApi.useParams();
	const input = { key };

	return useQuery(
		orpc.role.get.queryOptions({
			input,
			queryKey: orpc.role.get.queryKey({ input }),
		}),
	);
};

export const useRoleCreate = (): UseMutationResult<
	TRoleOut["create"],
	TRoleErr["create"],
	TRoleIn["create"]
> => {
	const queryClient = useQueryClient();

	return useMutation(
		orpc.role.create.mutationOptions({
			onSuccess: () => invalidateRoles(queryClient),
			onError: toastError,
		}),
	);
};

export const useRoleUpdate = (): UseMutationResult<
	TRoleOut["update"],
	TRoleErr["update"],
	TRoleIn["update"]
> => {
	const queryClient = useQueryClient();

	return useMutation(
		orpc.role.update.mutationOptions({
			onSuccess: () => invalidateRoles(queryClient),
			onError: toastError,
		}),
	);
};

export const useRoleDelete = (): UseMutationResult<
	TRoleOut["remove"],
	TRoleErr["remove"],
	TRoleIn["remove"]
> => {
	const queryClient = useQueryClient();

	return useMutation(
		orpc.role.remove.mutationOptions({
			onSuccess: () => invalidateRoles(queryClient),
			onError: toastError,
		}),
	);
};
