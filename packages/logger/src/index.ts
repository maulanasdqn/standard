import pino, { type Logger, type LoggerOptions } from "pino";
import { match } from "ts-pattern";

type TCreateLoggerOptions = {
	service: string;
	env: string;
	level?: string;
};

const transportFor = (env: string): LoggerOptions["transport"] =>
	match(env)
		.with("production", () => undefined)
		.otherwise(() => ({ target: "pino-pretty", options: { colorize: true } }));

const defaultLevelFor = (env: string): string =>
	match(env)
		.with("production", () => "info")
		.otherwise(() => "debug");

export const createLogger = ({
	service,
	env,
	level,
}: TCreateLoggerOptions): Logger =>
	pino({
		level: level ?? defaultLevelFor(env),
		base: { service },
		transport: transportFor(env),
	});

export type TLogger = ReturnType<typeof createLogger>;
