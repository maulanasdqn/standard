import { NOTE_MESSAGE } from "@app/messages";
import type { TNoteListInput, TNoteSort } from "@app/schemas";
import { D } from "@mobily/ts-belt";
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
import { toast } from "sonner";
import { match } from "ts-pattern";
import { orpc } from "#/libs/orpc/client.ts";
import { toastError } from "#/libs/orpc/toast-error.ts";
import type {
	TClientErrors,
	TClientInputs,
	TClientOutputs,
} from "#/libs/orpc/types.ts";
import type { TListChange } from "#/libs/table/list-patch.ts";

type TNoteIn = TClientInputs["note"];
type TNoteOut = TClientOutputs["note"];
type TNoteErr = TClientErrors["note"];

export type TNoteSearch = {
	value: string;
	onChange: (next: string) => void;
};

const listRouteApi = getRouteApi("/_authenticated/notes/");
const editRouteApi = getRouteApi("/_authenticated/notes/$noteId");

export const invalidateNotes = (queryClient: QueryClient): Promise<void> =>
	queryClient.invalidateQueries({ queryKey: orpc.note.key() });

export const noteListOptions = (
	input: TNoteListInput,
): UseSuspenseQueryOptions<TNoteOut["list"], TNoteErr["list"]> =>
	orpc.note.list.queryOptions({
		input,
		queryKey: orpc.note.list.queryKey({ input }),
	});

export const noteGetOptions = (
	id: string,
): UseSuspenseQueryOptions<TNoteOut["get"], TNoteErr["get"]> =>
	orpc.note.get.queryOptions({
		input: { id },
		queryKey: orpc.note.get.queryKey({ input: { id } }),
	});

export const useNoteList = (): UseSuspenseQueryResult<
	TNoteOut["list"],
	TNoteErr["list"]
> => useSuspenseQuery(noteListOptions(listRouteApi.useSearch()));

export const useNoteGet = (): UseSuspenseQueryResult<
	TNoteOut["get"],
	TNoteErr["get"]
> => useSuspenseQuery(noteGetOptions(editRouteApi.useParams().noteId));

export const useNoteSearch = (): TNoteSearch => {
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

export const useNoteListChange = (): TListChange<TNoteSort> => {
	const navigate = listRouteApi.useNavigate();
	return (patch): void => {
		void navigate({ search: (prev) => D.merge(prev, patch) });
	};
};

export const useNoteCreate = (): UseMutationResult<
	TNoteOut["create"],
	TNoteErr["create"],
	TNoteIn["create"]
> => {
	const queryClient = useQueryClient();

	return useMutation(
		orpc.note.create.mutationOptions({
			mutationKey: orpc.note.create.mutationKey(),
			onSuccess: () => {
				toast.success(NOTE_MESSAGE.CREATED);
				return invalidateNotes(queryClient);
			},
			onError: toastError,
		}),
	);
};

export const useNoteUpdate = (): UseMutationResult<
	TNoteOut["update"],
	TNoteErr["update"],
	TNoteIn["update"]
> => {
	const queryClient = useQueryClient();

	return useMutation(
		orpc.note.update.mutationOptions({
			mutationKey: orpc.note.update.mutationKey(),
			onSuccess: () => {
				toast.success(NOTE_MESSAGE.UPDATED);
				return invalidateNotes(queryClient);
			},
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
			onSuccess: () => {
				toast.success(NOTE_MESSAGE.DELETED);
				return invalidateNotes(queryClient);
			},
			onError: toastError,
		}),
	);
};
