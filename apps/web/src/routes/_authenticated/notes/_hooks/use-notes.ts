import type { TNoteListInput } from "@app/schemas";
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

type TNoteIn = TClientInputs["note"];
type TNoteOut = TClientOutputs["note"];
type TNoteErr = TClientErrors["note"];

const routeApi = getRouteApi("/_authenticated/notes/");

const invalidateNotes = (queryClient: QueryClient): Promise<void> =>
	queryClient.invalidateQueries({ queryKey: orpc.note.list.key() });

export const noteListOptions = (
	input: TNoteListInput,
): UseSuspenseQueryOptions<TNoteOut["list"], TNoteErr["list"]> =>
	orpc.note.list.queryOptions({
		input,
		queryKey: orpc.note.list.queryKey({ input }),
	});

export const useNoteList = (): UseSuspenseQueryResult<
	TNoteOut["list"],
	TNoteErr["list"]
> => useSuspenseQuery(noteListOptions(routeApi.useSearch()));

export const useNoteCreate = (): UseMutationResult<
	TNoteOut["create"],
	TNoteErr["create"],
	TNoteIn["create"]
> => {
	const queryClient = useQueryClient();

	return useMutation(
		orpc.note.create.mutationOptions({
			mutationKey: orpc.note.create.mutationKey(),
			onSuccess: () => invalidateNotes(queryClient),
			onError: toastError,
		}),
	);
};

export const useNoteDelete = (): UseMutationResult<
	TNoteOut["remove"],
	TNoteErr["remove"],
	TNoteIn["remove"]
> => {
	const queryClient = useQueryClient();

	return useMutation(
		orpc.note.remove.mutationOptions({
			mutationKey: orpc.note.remove.mutationKey(),
			onSuccess: () => invalidateNotes(queryClient),
			onError: toastError,
		}),
	);
};
