import pino, { type Logger, type LoggerOptions } from "pino";
import { match, P } from "ts-pattern";

const NODE_ENV = { PRODUCTION: "production" } as const;

const LEVEL = { INFO: "info", DEBUG: "debug" } as const;

const PRETTY_TARGET = "pino-pretty";

export const REDACT_PLACEHOLDER = "[redacted]";

export const REDACT_PATHS: readonly string[] = [
	"req.headers.authorization",
	"req.headers.cookie",
	"headers.authorization",
	"headers.cookie",
	"password",
	"*.password",
	"token",
	"*.token",
	"secret",
	"*.secret",
	"err.cause.connectionString",
	"err.cause.config.connectionString",
];

export type TLoggerTransport = {
	target: string;
	options?: Record<string, unknown>;
};

export type TLoggerOptionsInput = {
	service: string;
	env: string;
	level?: string;
	transport?: TLoggerTransport;
};

const defaultLevelFor = (env: string): string =>
	match(env)
		.with(NODE_ENV.PRODUCTION, (): string => LEVEL.INFO)
		.otherwise((): string => LEVEL.DEBUG);

const transportFor = (
	env: string,
	transport: TLoggerTransport | undefined,
): LoggerOptions["transport"] =>
	match(transport)
		.with(P.nonNullable, (found): LoggerOptions["transport"] => found)
		.otherwise((): LoggerOptions["transport"] =>
			match(env)
				.with(NODE_ENV.PRODUCTION, (): LoggerOptions["transport"] => undefined)
				.otherwise((): LoggerOptions["transport"] => ({
					target: PRETTY_TARGET,
					options: { colorize: true },
				})),
		);

export const loggerOptionsFor = (
	input: TLoggerOptionsInput,
): LoggerOptions => ({
	level: input.level ?? defaultLevelFor(input.env),
	base: { service: input.service },
	redact: { paths: [...REDACT_PATHS], censor: REDACT_PLACEHOLDER },
	transport: transportFor(input.env, input.transport),
});

export const loggerCreate = (input: TLoggerOptionsInput): Logger =>
	pino(loggerOptionsFor(input));

export type TLogger = ReturnType<typeof loggerCreate>;
