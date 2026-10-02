import { loggerCreate, type TLogger, type TLoggerTransport } from "@app/logger";
import { match, P } from "ts-pattern";
import { env } from "#/platform/config/env.ts";

const SERVICE = "api";

const transportFor = (
	target: string | undefined,
	options: Record<string, unknown> | undefined,
): TLoggerTransport | undefined =>
	match(target)
		.with(P.nullish, (): undefined => undefined)
		.otherwise((found): TLoggerTransport => ({ target: found, options }));

let created: TLogger | null = null;

const loggerRead = (): TLogger => {
	created ??= loggerCreate({
		service: SERVICE,
		env: env.NODE_ENV,
		level: env.LOG_LEVEL,
		transport: transportFor(
			env.LOG_TRANSPORT_TARGET,
			env.LOG_TRANSPORT_OPTIONS,
		),
	});
	return created;
};

export const logger: TLogger = new Proxy({} as TLogger, {
	get: (_target, key): unknown => {
		const instance = loggerRead();
		const value: unknown = Reflect.get(instance, key, instance);
		return value instanceof Function ? value.bind(instance) : value;
	},
	set: (_target, key, value: unknown): boolean =>
		Reflect.set(loggerRead(), key, value),
});
