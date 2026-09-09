import type { TPermission } from "@app/permissions";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { match, P } from "ts-pattern";
import { refreshSession } from "#/libs/auth/session.ts";
import { sessionStore } from "#/libs/auth/session-store.ts";
import { queryClient } from "#/libs/tanstack-query/index.ts";
import { routeTree } from "./routeTree.gen.ts";
import "./styles.css";

const router = createRouter({
	routeTree,
	context: { queryClient, session: null, permissions: [] },
	defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

sessionStore.subscribe(() => {
	const session = sessionStore.state;
	router.update({
		...router.options,
		context: {
			queryClient,
			session,
			permissions: (session?.permissions ?? []) as TPermission[],
		},
	});
	void router.invalidate();
});

const bootstrap = async (): Promise<void> => {
	await refreshSession();

	const rootElement = document.getElementById("root");

	match(rootElement)
		.with(P.nullish, () => {
			throw new Error("Root element not found");
		})
		.otherwise((root) => {
			createRoot(root).render(
				<StrictMode>
					<QueryClientProvider client={queryClient}>
						<RouterProvider router={router} />
						<Toaster />
					</QueryClientProvider>
				</StrictMode>,
			);
		});
};

void bootstrap();
