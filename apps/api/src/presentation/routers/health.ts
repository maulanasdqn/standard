import { z } from "zod";
import { publicProcedure } from "#/presentation/orpc/middleware.ts";

export const healthRouterBuild = () => ({
	check: publicProcedure
		.route({ method: "GET", path: "/health" })
		.output(z.object({ status: z.literal("ok") }))
		.handler(() => ({ status: "ok" as const })),
});
