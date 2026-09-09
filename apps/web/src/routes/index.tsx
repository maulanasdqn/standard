import { createFileRoute, redirect } from "@tanstack/react-router";
import { match, P } from "ts-pattern";

export const Route = createFileRoute("/")({
	beforeLoad: ({ context }) => {
		throw redirect({
			to: match(context.session)
				.with(P.nullish, () => "/login" as const)
				.otherwise(() => "/notes" as const),
		});
	},
});
