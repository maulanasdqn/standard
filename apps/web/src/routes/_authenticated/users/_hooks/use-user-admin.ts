import { USER_MESSAGE } from "@app/messages";
import {
	type UseMutationResult,
	type UseQueryOptions,
	type UseQueryResult,
	useQuery,
} from "@tanstack/react-query";
import { orpc } from "#/libs/orpc/client.ts";
import { useProcedureMutation } from "#/libs/orpc/procedure-mutation.ts";
import type {
	TClientErrors,
	TClientInputs,
	TClientOutputs,
} from "#/libs/orpc/types.ts";
import { userAndRoleKeys } from "#/routes/_authenticated/users/_hooks/use-users.ts";

type TUserIn = TClientInputs["user"];
type TUserOut = TClientOutputs["user"];
type TUserErr = TClientErrors["user"];

export const userSessionsOptions = (
	id: string,
): UseQueryOptions<TUserOut["sessions"], TUserErr["sessions"]> =>
	orpc.user.sessions.queryOptions({ input: { id } });

export const useUserSessions = (
	id: string,
): UseQueryResult<TUserOut["sessions"], TUserErr["sessions"]> =>
	useQuery(userSessionsOptions(id));

export const useUserInvite = (): UseMutationResult<
	TUserOut["invite"],
	TUserErr["invite"],
	TUserIn["invite"]
> =>
	useProcedureMutation(orpc.user.invite, {
		message: USER_MESSAGE.INVITED,
		invalidates: userAndRoleKeys(),
	});

export const useUserDeactivate = (): UseMutationResult<
	TUserOut["deactivate"],
	TUserErr["deactivate"],
	TUserIn["deactivate"]
> =>
	useProcedureMutation(orpc.user.deactivate, {
		message: USER_MESSAGE.DEACTIVATED,
		invalidates: userAndRoleKeys(),
	});

export const useUserReactivate = (): UseMutationResult<
	TUserOut["reactivate"],
	TUserErr["reactivate"],
	TUserIn["reactivate"]
> =>
	useProcedureMutation(orpc.user.reactivate, {
		message: USER_MESSAGE.REACTIVATED,
		invalidates: userAndRoleKeys(),
	});

export const useUserSessionRevoke = (): UseMutationResult<
	TUserOut["sessionRevoke"],
	TUserErr["sessionRevoke"],
	TUserIn["sessionRevoke"]
> =>
	useProcedureMutation(orpc.user.sessionRevoke, {
		message: USER_MESSAGE.SESSION_REVOKED,
		invalidates: userAndRoleKeys(),
	});

export const useUserSessionsRevoke = (): UseMutationResult<
	TUserOut["sessionsRevoke"],
	TUserErr["sessionsRevoke"],
	TUserIn["sessionsRevoke"]
> =>
	useProcedureMutation(orpc.user.sessionsRevoke, {
		message: USER_MESSAGE.SESSIONS_REVOKED,
		invalidates: userAndRoleKeys(),
	});
