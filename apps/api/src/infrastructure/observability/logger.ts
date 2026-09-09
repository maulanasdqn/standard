import { loggerCreate } from "@app/logger";
import { env } from "#/infrastructure/config/env.ts";

export const logger = loggerCreate({ service: "api", env: env.NODE_ENV });
