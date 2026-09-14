import type { TBaseEntity } from "@app/schemas";
import type { Effect } from "effect";
import type { TDomainError } from "#/shared/errors.ts";

export type TApplicationInput = {
	readonly list: unknown;
	readonly get: unknown;
	readonly create: unknown;
	readonly update: unknown;
	readonly remove: unknown;
};

export type TApplicationEffect<TOutput> = Effect.Effect<
	TOutput,
	TDomainError,
	unknown
>;

export type TBaseApplication<
	TEntity extends TBaseEntity,
	TList,
	TIdentifier,
	TInput extends TApplicationInput,
> = {
	readonly list: (input: TInput["list"]) => TApplicationEffect<TList>;
	readonly get: (input: TInput["get"]) => TApplicationEffect<TEntity>;
	readonly create: (
		input: TInput["create"],
		actorId: string,
	) => TApplicationEffect<TEntity>;
	readonly update: (
		input: TInput["update"],
		actorId: string,
	) => TApplicationEffect<TEntity>;
	readonly remove: (
		input: TInput["remove"],
		actorId: string,
	) => TApplicationEffect<TIdentifier>;
};
