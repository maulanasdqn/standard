import { match, P } from "ts-pattern";
import type { TCacheClient } from "./cache-client.ts";

export type TCache = {
	get: <TValue>(key: string) => Promise<TValue | null>;
	set: <TValue>(
		key: string,
		value: TValue,
		ttlSeconds: number,
	) => Promise<void>;
	del: (key: string) => Promise<void>;
};

const decode = <TValue>(raw: string | null): TValue | null =>
	match(raw)
		.with(P.nullish, (): TValue | null => null)
		.otherwise((found): TValue | null => JSON.parse(found) as TValue);

export const cacheCreate = (client: TCacheClient): TCache => {
	const get = async <TValue>(key: string): Promise<TValue | null> =>
		decode<TValue>(await client.get(key));

	const set = async <TValue>(
		key: string,
		value: TValue,
		ttlSeconds: number,
	): Promise<void> => {
		await client.setex(key, ttlSeconds, JSON.stringify(value));
	};

	const del = async (key: string): Promise<void> => {
		await client.del(key);
	};

	return { get, set, del };
};
