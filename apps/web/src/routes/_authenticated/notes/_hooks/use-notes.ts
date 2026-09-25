import { NOTE_MESSAGE } from "@app/messages";
import type { TNoteListInput, TNoteSort } from "@app/schemas";
import { D } from "@mobily/ts-belt";
import {
	type QueryClient,
	type UseMutationResult,
	type UseSuspenseQueryOptions,
	type UseSuspenseQueryResult,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { match } from "ts-pattern";
import { orpc } from "#/libs/orpc/client.ts";
import {
	invalidateKeys,
	useProcedureMutation,
} from "#/libs/orpc/procedure-mutation.ts";
import { suspenseQueryOptionsFor } from "#/libs/orpc/procedure-query.ts";
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

const noteKeys = (): readonly (readonly unknown[])[] => [orpc.note.key()];

export const invalidateNotes = (queryClient: QueryClient): Promise<void> =>
	invalidateKeys(queryClient, noteKeys());

export const noteListOptions = (
	input: TNoteListInput,
): UseSuspenseQueryOptions<TNoteOut["list"], TNoteErr["list"]> =>
	suspenseQueryOptionsFor(orpc.note.list, input);

export const noteGetOptions = (
	id: string,
): UseSuspenseQueryOptions<TNoteOut["get"], TNoteErr["get"]> =>
	suspenseQueryOptionsFor(orpc.note.get, { id });

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
> =>
	useProcedureMutation(orpc.note.create, {
		message: NOTE_MESSAGE.CREATED,
		invalidates: noteKeys(),
	});

export const useNoteUpdate = (): UseMutationResult<
	TNoteOut["update"],
	TNoteErr["update"],
	TNoteIn["update"]
> =>
	useProcedureMutation(orpc.note.update, {
		message: NOTE_MESSAGE.UPDATED,
		invalidates: noteKeys(),
	});

export const useNoteDelete = (): UseMutationResult<
	TNoteOut["remove"],
	TNoteErr["remove"],
	TNoteIn["remove"]
> =>
	useProcedureMutation(orpc.note.remove, {
		message: NOTE_MESSAGE.DELETED,
		invalidates: noteKeys(),
	});
