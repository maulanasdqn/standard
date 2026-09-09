import type { RouterClient } from "@orpc/server";
import type { TAppRouter } from "./presentation/routers/index.ts";

export type { ISession, ISessionUser } from "./domain/session/session.ts";
export type { TAppRouter } from "./presentation/routers/index.ts";
export type TAppRouterClient = RouterClient<TAppRouter>;
