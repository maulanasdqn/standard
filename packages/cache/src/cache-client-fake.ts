import { match } from "ts-pattern";
import type { TCacheClient } from "./cache-client.ts";

export type TCacheClientFake = TCacheClient & {
	entries: Map<string, string>;
	expiries: Map<string, number>;
};

const FOUND = 1;
const MISSING = 0;

export const cacheClientFake = (): TCacheClientFake => {
	const entries = new Map<string, string>();
	const expiries = new Map<string, number>();

	const get = async (key: string): Promise<string | null> =>
		entries.get(key) ?? null;

	const setex = async (
		key: string,
		seconds: number,
		value: string,
	): Promise<unknown> => {
		entries.set(key, value);
		expiries.set(key, seconds);
		return undefined;
	};

	const del = async (key: string): Promise<number> =>
		match(entries.delete(key))
			.with(true, (): number => FOUND)
			.otherwise((): number => MISSING);

	const incr = async (key: string): Promise<number> => {
		const next = Number(entries.get(key) ?? MISSING) + FOUND;
		entries.set(key, String(next));
		return next;
	};

	const expire = async (key: string, seconds: number): Promise<number> =>
		match(entries.has(key))
			.with(true, (): number => {
				expiries.set(key, seconds);
				return FOUND;
			})
			.otherwise((): number => MISSING);

	return { entries, expiries, get, setex, del, incr, expire };
};
