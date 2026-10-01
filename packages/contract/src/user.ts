import {
	userCreateInputSchema,
	userIdInputSchema,
	userInviteInputSchema,
	userListInputSchema,
	userListSchema,
	userPasswordResetInputSchema,
	userSchema,
	userSessionListSchema,
	userSessionRevokeInputSchema,
	userUpdateInputSchema,
} from "@app/schemas";
import { oc } from "@orpc/contract";
import { z } from "zod";
import { HTTP_METHOD } from "./http-methods.ts";
import { ROUTE_PATH } from "./route-paths.ts";

export const userContract = {
	list: oc
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.USERS })
		.input(userListInputSchema)
		.output(userListSchema),

	get: oc
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.USER })
		.input(userIdInputSchema)
		.output(userSchema),

	create: oc
		.route({ method: HTTP_METHOD.POST, path: ROUTE_PATH.USERS })
		.input(userCreateInputSchema)
		.output(userSchema),

	update: oc
		.route({ method: HTTP_METHOD.PATCH, path: ROUTE_PATH.USER })
		.input(userUpdateInputSchema)
		.output(userSchema),

	remove: oc
		.route({ method: HTTP_METHOD.DELETE, path: ROUTE_PATH.USER })
		.input(userIdInputSchema)
		.output(z.object({ id: z.uuid() })),

	resetPassword: oc
		.route({ method: HTTP_METHOD.POST, path: ROUTE_PATH.USER_PASSWORD })
		.input(userPasswordResetInputSchema)
		.output(z.object({ id: z.uuid() })),

	invite: oc
		.route({ method: HTTP_METHOD.POST, path: ROUTE_PATH.USER_INVITE })
		.input(userInviteInputSchema)
		.output(userSchema),

	deactivate: oc
		.route({ method: HTTP_METHOD.POST, path: ROUTE_PATH.USER_DEACTIVATE })
		.input(userIdInputSchema)
		.output(userSchema),

	reactivate: oc
		.route({ method: HTTP_METHOD.POST, path: ROUTE_PATH.USER_REACTIVATE })
		.input(userIdInputSchema)
		.output(userSchema),

	sessions: oc
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.USER_SESSIONS })
		.input(userIdInputSchema)
		.output(userSessionListSchema),

	sessionRevoke: oc
		.route({ method: HTTP_METHOD.DELETE, path: ROUTE_PATH.USER_SESSION })
		.input(userSessionRevokeInputSchema)
		.output(z.object({ id: z.string() })),

	twoFactorReset: oc
		.route({ method: HTTP_METHOD.DELETE, path: ROUTE_PATH.USER_TWO_FACTOR })
		.input(userIdInputSchema)
		.output(userSchema),

	sessionsRevoke: oc
		.route({ method: HTTP_METHOD.DELETE, path: ROUTE_PATH.USER_SESSIONS })
		.input(userIdInputSchema)
		.output(z.object({ id: z.string() })),
};
