import { createLogger } from "@app/logger";
import { env } from "#/infrastructure/config/env.ts";

export const logger = createLogger({ service: "api", env: env.NODE_ENV });
