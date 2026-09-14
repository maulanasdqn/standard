import { envSchema, type TEnv } from "#/infrastructure/config/env-schema.ts";

export type { TEnv } from "#/infrastructure/config/env-schema.ts";

export const env: TEnv = envSchema.parse(process.env);
