import { A, D } from "@mobily/ts-belt";
import type { AnyContractProcedure } from "@orpc/contract";
import { describe, expect, it } from "vitest";
import { HTTP_METHOD } from "./http-methods.ts";
import { appContract } from "./index.ts";
import { contractProceduresOf } from "./procedures.ts";
import { ROUTE_PATH } from "./route-paths.ts";

const PATH_SEPARATOR = ".";

type TNamedProcedure = { name: string; procedure: AnyContractProcedure };

const procedures: readonly TNamedProcedure[] = A.map(
	contractProceduresOf(appContract),
	(entry): TNamedProcedure => ({
		name: A.join(entry.path, PATH_SEPARATOR),
		procedure: entry.procedure,
	}),
);

const routeOf = (
	found: TNamedProcedure,
): readonly [string, string | undefined, string | undefined] => [
	found.name,
	found.procedure["~orpc"].route.method,
	found.procedure["~orpc"].route.path,
];

describe("appContract", () => {
	it("declares every procedure the web client calls", (): void => {
		expect(A.map(procedures, (found) => found.name)).toEqual(
			expect.arrayContaining([
				"health.check",
				"me.get",
				"note.list",
				"note.get",
				"note.create",
				"note.update",
				"note.remove",
				"note.attachment.list",
				"note.attachment.upload",
				"note.attachment.remove",
				"user.list",
				"user.get",
				"user.create",
				"user.update",
				"user.remove",
				"user.resetPassword",
				"role.list",
				"role.get",
				"role.create",
				"role.update",
				"role.remove",
				"permission.list",
				"activity.list",
				"newsletter.subscribe",
				"newsletter.list",
				"newsletter.remove",
			]),
		);
	});

	it("gives every procedure a method and a path from the shared constants", (): void => {
		const methods: readonly string[] = D.values(HTTP_METHOD);
		const paths: readonly string[] = D.values(ROUTE_PATH);

		A.forEach(A.map(procedures, routeOf), ([name, method, path]) => {
			expect({ name, method: methods.includes(method ?? "") }).toEqual({
				name,
				method: true,
			});
			expect({ name, path: paths.includes(path ?? "") }).toEqual({
				name,
				path: true,
			});
		});
	});

	it("gives every procedure an output schema", (): void => {
		A.forEach(procedures, (found) => {
			expect({
				name: found.name,
				output: found.procedure["~orpc"].outputSchema !== undefined,
			}).toEqual({ name: found.name, output: true });
		});
	});
});
