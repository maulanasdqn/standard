export const ENV = {
	BETTER_AUTH_SECRET: "a-32-character-production-secret!",
	BETTER_AUTH_URL: "https://api.standard.test",
	DATABASE_URL: "postgres://app:app@localhost:5432/app",
	RABBITMQ_URL: "amqp://app:app@localhost:5672",
	REDIS_URL: "redis://localhost:6379",
	STORAGE_ENDPOINT: "https://objects.standard.test",
	STORAGE_BUCKET: "standard",
	STORAGE_ACCESS_KEY_ID: "storage-key",
	STORAGE_SECRET_ACCESS_KEY: "storage-secret",
	WEB_ORIGIN: "https://standard.test",
} as const;

export const METRICS_TOKEN = "a-32-character-metrics-scrape-tok";
