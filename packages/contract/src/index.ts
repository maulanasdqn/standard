import { A } from "@mobily/ts-belt";
import type { ContractRouterClient } from "@orpc/contract";
import { activityContract } from "./activity.ts";
import { healthContract } from "./health.ts";
import { meContract } from "./me.ts";
import { newsletterContract } from "./newsletter.ts";
import { noteContract } from "./note.ts";
import { permissionContract } from "./permission.ts";
import { contractProceduresOf } from "./procedures.ts";
import { roleContract } from "./role.ts";
import { userContract } from "./user.ts";

export { API_BASE_PATH, apiPathOf } from "./api-paths.ts";
export { HTTP_METHOD, type THttpMethod } from "./http-methods.ts";
export {
	contractProceduresOf,
	type TContractProcedureEntry,
} from "./procedures.ts";
export { ROUTE_PATH, type TRoutePath } from "./route-paths.ts";
export { WEB_BASE_PATH, webPathOf } from "./web-paths.ts";

export const appContract = {
	health: healthContract,
	me: meContract,
	note: noteContract,
	user: userContract,
	role: roleContract,
	permission: permissionContract,
	activity: activityContract,
	newsletter: newsletterContract,
};

export type TAppContract = typeof appContract;

const PROCEDURE_PATH_SEPARATOR = "/";

export const PROCEDURE_PATHS: readonly string[] = A.map(
	contractProceduresOf(appContract),
	(entry): string =>
		`${PROCEDURE_PATH_SEPARATOR}${A.join(entry.path, PROCEDURE_PATH_SEPARATOR)}`,
);

export type TAppRouterClient = ContractRouterClient<TAppContract>;
