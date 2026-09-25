import { beforeEach, describe, expect, it, vi } from "vitest";

const { migrate, poolEnd } = vi.hoisted(() => ({
	migrate: vi.fn(),
	poolEnd: vi.fn(),
}));

vi.mock("drizzle-orm/node-postgres/migrator", () => ({
	migrate: (...args: unknown[]): unknown => migrate(...args),
}));

vi.mock("drizzle-orm/node-postgres", () => ({
	drizzle: (): Record<string, never> => ({}),
}));

vi.mock("pg", () => ({
	Pool: class {
		end = (): Promise<void> => poolEnd();
	},
}));

vi.mock("@app/logger", () => ({
	loggerCreate: (): { info: () => undefined } => ({
		info: (): undefined => undefined,
	}),
}));

const { migrationsRun } = await import("./index.ts");

const OPTIONS = {
	service: "api",
	migrationsFolder: "/srv/app/drizzle",
	databaseUrl: "postgres://app:app@localhost:5432/app",
	migrationsSchema: "reporting",
	migrationsTable: "journal",
};

describe("migrationsRun", () => {
	beforeEach((): void => {
		migrate.mockReset();
		poolEnd.mockReset();
		poolEnd.mockResolvedValue(undefined);
	});

	it("applies the folder into the journal schema and table it is given, then closes the pool", async (): Promise<void> => {
		migrate.mockResolvedValue(undefined);

		await migrationsRun(OPTIONS);

		expect(migrate).toHaveBeenCalledWith(expect.anything(), {
			migrationsFolder: OPTIONS.migrationsFolder,
			migrationsSchema: OPTIONS.migrationsSchema,
			migrationsTable: OPTIONS.migrationsTable,
		});
		expect(poolEnd).toHaveBeenCalledTimes(1);
	});

	it("closes the pool and rethrows when a migration fails", async (): Promise<void> => {
		const failure = new Error("relation already exists");
		migrate.mockRejectedValue(failure);

		await expect(migrationsRun(OPTIONS)).rejects.toBe(failure);
		expect(poolEnd).toHaveBeenCalledTimes(1);
	});
});
