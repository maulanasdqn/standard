import { Redis } from "ioredis";

export const createCache = (redisUrl: string): Redis =>
	new Redis(redisUrl, { maxRetriesPerRequest: null });
