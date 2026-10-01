import { AUTH_MESSAGE } from "@app/messages";
import { A } from "@mobily/ts-belt";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "#/libs/auth/client.ts";

const OWN_SESSIONS_KEY = ["auth", "own-sessions"] as const;

export type TOwnSession = {
	id: string;
	token: string;
	ipAddress: string | null;
	userAgent: string | null;
	createdAt: Date;
	updatedAt: Date;
	current: boolean;
};

export type TOwnSessions = {
	sessions: readonly TOwnSession[];
	isLoading: boolean;
	isError: boolean;
	hasOthers: boolean;
	pending: boolean;
	revoke: (token: string) => void;
	revokeOthers: () => void;
};

const ownSessionsFetch = async (): Promise<readonly TOwnSession[]> => {
	const [list, current] = await Promise.all([
		authClient.listSessions(),
		authClient.getSession(),
	]);
	const currentToken = current.data?.session.token;
	return A.map(list.data ?? [], (session) => ({
		id: session.id,
		token: session.token,
		ipAddress: session.ipAddress ?? null,
		userAgent: session.userAgent ?? null,
		createdAt: new Date(session.createdAt),
		updatedAt: new Date(session.updatedAt),
		current: session.token === currentToken,
	}));
};

const sessionOrder = (left: TOwnSession, right: TOwnSession): number =>
	Number(right.current) - Number(left.current) ||
	right.updatedAt.getTime() - left.updatedAt.getTime();

const failureToast = (): void => {
	toast.error(AUTH_MESSAGE.SESSION_REVOKE_FAILED);
};

export const useOwnSessions = (): TOwnSessions => {
	const queryClient = useQueryClient();
	const query = useQuery({
		queryKey: OWN_SESSIONS_KEY,
		queryFn: ownSessionsFetch,
	});
	const refresh = (): Promise<void> =>
		queryClient.invalidateQueries({ queryKey: OWN_SESSIONS_KEY });

	const revoke = useMutation({
		mutationFn: (token: string) => authClient.revokeSession({ token }),
		onSuccess: async (): Promise<void> => {
			await refresh();
			toast.success(AUTH_MESSAGE.SESSION_REVOKED);
		},
		onError: failureToast,
	});

	const revokeOthers = useMutation({
		mutationFn: () => authClient.revokeOtherSessions(),
		onSuccess: async (): Promise<void> => {
			await refresh();
			toast.success(AUTH_MESSAGE.SESSIONS_REVOKED);
		},
		onError: failureToast,
	});

	const sessions = A.sort(query.data ?? [], sessionOrder);

	return {
		sessions,
		isLoading: query.isLoading,
		isError: query.isError,
		hasOthers: A.some(sessions, (session) => !session.current),
		pending: revoke.isPending || revokeOthers.isPending,
		revoke: (token: string): void => revoke.mutate(token),
		revokeOthers: (): void => revokeOthers.mutate(),
	};
};
