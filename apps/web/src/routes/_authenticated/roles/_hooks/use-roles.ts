import {
	type QueryClient,
	type UseMutationResult,
	type UseSuspenseQueryOptions,
	type UseSuspenseQueryResult,
	useMutation,
	useQueryClient,
	useSuspenseQuery,
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

const invalidateRoles = (queryClient: QueryClient): Promise<void> =>
	queryClient.invalidateQueries({ queryKey: orpc.role.key() });

export const roleListOptions = (): UseSuspenseQueryOptions<
	TRoleOut["list"],
	TRoleErr["list"]
> => orpc.role.list.queryOptions({ queryKey: orpc.role.list.queryKey() });

export const roleGetOptions = (
	key: string,
): UseSuspenseQueryOptions<TRoleOut["get"], TRoleErr["get"]> =>
	orpc.role.get.queryOptions({
		input: { key },
		queryKey: orpc.role.get.queryKey({ input: { key } }),
	});

export const useRoleList = (): UseSuspenseQueryResult<
	TRoleOut["list"],
	TRoleErr["list"]
> => useSuspenseQuery(roleListOptions());

export const useRoleGet = (): UseSuspenseQueryResult<
	TRoleOut["get"],
	TRoleErr["get"]
> => useSuspenseQuery(roleGetOptions(editRouteApi.useParams().key));

export const useRoleCreate = (): UseMutationResult<
	TRoleOut["create"],
	TRoleErr["create"],
	TRoleIn["create"]
> => {
	const queryClient = useQueryClient();

	return useMutation(
		orpc.role.create.mutationOptions({
			mutationKey: orpc.role.create.mutationKey(),
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
			mutationKey: orpc.role.update.mutationKey(),
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
			mutationKey: orpc.role.remove.mutationKey(),
			onSuccess: () => invalidateRoles(queryClient),
			onError: toastError,
		}),
	);
};
