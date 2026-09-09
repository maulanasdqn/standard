import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { orpc } from "#/libs/orpc/client.ts";

const routeApi = getRouteApi("/_authenticated/notes/");

export const useNotes = () => {
	const search = routeApi.useSearch();

	return useQuery(
		orpc.note.list.queryOptions({
			input: search,
			queryKey: orpc.note.list.queryKey({ input: search }),
		}),
	);
};

export const useCreateNote = () => {
	const queryClient = useQueryClient();

	return useMutation(
		orpc.note.create.mutationOptions({
			onSuccess: () => {
				void queryClient.invalidateQueries({ queryKey: orpc.note.list.key() });
			},
		}),
	);
};

export const useDeleteNote = () => {
	const queryClient = useQueryClient();

	return useMutation(
		orpc.note.remove.mutationOptions({
			onSuccess: () => {
				void queryClient.invalidateQueries({ queryKey: orpc.note.list.key() });
			},
		}),
	);
};
