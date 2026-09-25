import {
	noteCreateInputSchema,
	noteIdInputSchema,
	noteListInputSchema,
	noteListSchema,
	noteSchema,
	noteUpdateInputSchema,
} from "@app/schemas";
import { oc } from "@orpc/contract";
import { z } from "zod";
import { HTTP_METHOD } from "./http-methods.ts";
import { ROUTE_PATH } from "./route-paths.ts";

export const noteContract = {
	list: oc
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.NOTES })
		.input(noteListInputSchema)
		.output(noteListSchema),

	get: oc
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.NOTE })
		.input(noteIdInputSchema)
		.output(noteSchema),

	create: oc
		.route({ method: HTTP_METHOD.POST, path: ROUTE_PATH.NOTES })
		.input(noteCreateInputSchema)
		.output(noteSchema),

	update: oc
		.route({ method: HTTP_METHOD.PATCH, path: ROUTE_PATH.NOTE })
		.input(noteUpdateInputSchema)
		.output(noteSchema),

	remove: oc
		.route({ method: HTTP_METHOD.DELETE, path: ROUTE_PATH.NOTE })
		.input(noteIdInputSchema)
		.output(z.object({ id: z.uuid() })),
};
