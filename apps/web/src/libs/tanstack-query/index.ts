import { QueryClient } from "@tanstack/react-query";
import { queryRetry } from "#/libs/tanstack-query/retry.ts";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30_000,
			retry: queryRetry,
		},
	},
});
