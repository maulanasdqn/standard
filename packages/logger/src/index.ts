import pino from "pino";

type TCreateLoggerOptions = {
	service: string;
	env: string;
	level?: string;
};

export const createLogger = ({ service, env, level }: TCreateLoggerOptions) =>
	pino({
		level: level ?? (env === "production" ? "info" : "debug"),
		base: { service },
		transport:
			env === "production"
				? undefined
				: { target: "pino-pretty", options: { colorize: true } },
	});

export type TLogger = ReturnType<typeof createLogger>;
