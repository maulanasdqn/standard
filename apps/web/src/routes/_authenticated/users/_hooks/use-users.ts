import { D } from "@mobily/ts-belt";
import {
	type QueryClient,
	type UseMutationResult,
	type UseQueryResult,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { match } from "ts-pattern";
import { useSession } from "#/libs/auth/use-session.ts";
import { orpc } from "#/libs/orpc/client.ts";
import { toastError } from "#/libs/orpc/toast-error.ts";
import type {
	TClientErrors,
	TClientInputs,
	TClientOutputs,
} from "#/libs/orpc/types.ts";

type TUserIn = TClientInputs["user"];
type TUserOut = TClientOutputs["user"];
type TUserErr = TClientErrors["user"];

export type TUserSearch = {
	value: string;
	onChange: (next: string) => void;
};

const listRouteApi = getRouteApi("/_authenticated/users/");
const editRouteApi = getRouteApi("/_authenticated/users/$userId");

const invalidateUsersAndRoles = (queryClient: QueryClient): void => {
	void queryClient.invalidateQueries({ queryKey: orpc.user.key() });
	void queryClient.invalidateQueries({ queryKey: orpc.role.key() });
};

export const useUserList = (): UseQueryResult<
	TUserOut["list"],
	TUserErr["list"]
> => {
	const search = listRouteApi.useSearch();

	return useQuery(
		orpc.user.list.queryOptions({
			input: search,
			queryKey: orpc.user.list.queryKey({ input: search }),
		}),
	);
};

export const useUserGet = (): UseQueryResult<
	TUserOut["get"],
	TUserErr["get"]
> => {
	const { userId } = editRouteApi.useParams();
	const input = { id: userId };

	return useQuery(
		orpc.user.get.queryOptions({
			input,
			queryKey: orpc.user.get.queryKey({ input }),
		}),
	);
};

export const useUserSearch = (): TUserSearch => {
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

export const useUserPageChange = (): ((page: number) => void) => {
	const navigate = listRouteApi.useNavigate();
	return (page: number): void => {
		void navigate({ search: (prev) => D.merge(prev, { page }) });
	};
};

export const useIsSelf = (): ((id: string) => boolean) => {
	const session = useSession();
	return (id: string): boolean => session?.user.id === id;
};

export const useUserCreate = (): UseMutationResult<
	TUserOut["create"],
	TUserErr["create"],
	TUserIn["create"]
> => {
	const queryClient = useQueryClient();

	return useMutation(
		orpc.user.create.mutationOptions({
			onSuccess: () => invalidateUsersAndRoles(queryClient),
			onError: toastError,
		}),
	);
};

export const useUserUpdate = (): UseMutationResult<
	TUserOut["update"],
	TUserErr["update"],
	TUserIn["update"]
> => {
	const queryClient = useQueryClient();

	return useMutation(
		orpc.user.update.mutationOptions({
			onSuccess: () => invalidateUsersAndRoles(queryClient),
			onError: toastError,
		}),
	);
};

export const useUserDelete = (): UseMutationResult<
	TUserOut["remove"],
	TUserErr["remove"],
	TUserIn["remove"]
> => {
	const queryClient = useQueryClient();

	return useMutation(
		orpc.user.remove.mutationOptions({
			onSuccess: () => invalidateUsersAndRoles(queryClient),
			onError: toastError,
		}),
	);
};
