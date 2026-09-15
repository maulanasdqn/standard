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
	TActor = string,
> = {
	readonly list: (
		input: TInput["list"],
		actor: TActor,
	) => TApplicationEffect<TList>;
	readonly get: (
		input: TInput["get"],
		actor: TActor,
	) => TApplicationEffect<TEntity>;
	readonly create: (
		input: TInput["create"],
		actor: TActor,
	) => TApplicationEffect<TEntity>;
	readonly update: (
		input: TInput["update"],
		actor: TActor,
	) => TApplicationEffect<TEntity>;
	readonly remove: (
		input: TInput["remove"],
		actor: TActor,
	) => TApplicationEffect<TIdentifier>;
};
