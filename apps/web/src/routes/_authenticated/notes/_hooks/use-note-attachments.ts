import { NOTE_ATTACHMENT_MESSAGE } from "@app/messages";
import {
	type QueryClient,
	type UseMutationResult,
	type UseSuspenseQueryOptions,
	type UseSuspenseQueryResult,
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { orpc } from "#/libs/orpc/client.ts";
import { toastError } from "#/libs/orpc/toast-error.ts";
import type {
	TClientErrors,
	TClientInputs,
	TClientOutputs,
} from "#/libs/orpc/types.ts";

type TAttachmentIn = TClientInputs["note"]["attachment"];
type TAttachmentOut = TClientOutputs["note"]["attachment"];
type TAttachmentErr = TClientErrors["note"]["attachment"];

const ATTACHMENT_STALE_MS = 300_000;

export const invalidateNoteAttachments = (
	queryClient: QueryClient,
): Promise<void> =>
	queryClient.invalidateQueries({ queryKey: orpc.note.attachment.key() });

export const noteAttachmentListOptions = (
	noteId: string,
): UseSuspenseQueryOptions<TAttachmentOut["list"], TAttachmentErr["list"]> =>
	orpc.note.attachment.list.queryOptions({
		input: { noteId },
		queryKey: orpc.note.attachment.list.queryKey({ input: { noteId } }),
		staleTime: ATTACHMENT_STALE_MS,
	});

export const useNoteAttachmentList = (
	noteId: string,
): UseSuspenseQueryResult<TAttachmentOut["list"], TAttachmentErr["list"]> =>
	useSuspenseQuery(noteAttachmentListOptions(noteId));

export const useNoteAttachmentUpload = (): UseMutationResult<
	TAttachmentOut["upload"],
	TAttachmentErr["upload"],
	TAttachmentIn["upload"]
> => {
	const queryClient = useQueryClient();

	return useMutation(
		orpc.note.attachment.upload.mutationOptions({
			mutationKey: orpc.note.attachment.upload.mutationKey(),
			onSuccess: () => invalidateNoteAttachments(queryClient),
			onError: toastError,
		}),
	);
};

export const useNoteAttachmentRemove = (): UseMutationResult<
	TAttachmentOut["remove"],
	TAttachmentErr["remove"],
	TAttachmentIn["remove"]
> => {
	const queryClient = useQueryClient();

	return useMutation(
		orpc.note.attachment.remove.mutationOptions({
			mutationKey: orpc.note.attachment.remove.mutationKey(),
			onSuccess: () => {
				toast.success(NOTE_ATTACHMENT_MESSAGE.DELETED);
				return invalidateNoteAttachments(queryClient);
			},
			onError: toastError,
		}),
	);
};
