import { A } from "@mobily/ts-belt";
import { match } from "ts-pattern";
import {
	MIGRATION_SAFETY_MARKER,
	PRE_POLICY_MIGRATIONS,
	REMEDY,
	UNSAFE_STATEMENTS,
	type TUnsafeStatement,
} from "./migration-rules.ts";

export type TMigrationViolation = {
	file: string;
	line: number;
	statement: TUnsafeStatement;
	source: string;
	remedy: string;
};

const FIRST_LINE = 1;

const isExempt = (file: string, contents: string): boolean =>
	A.includes(PRE_POLICY_MIGRATIONS, file) ||
	contents.toLowerCase().includes(MIGRATION_SAFETY_MARKER.toLowerCase());

const matchesIn = (
	file: string,
	line: string,
	index: number,
): readonly TMigrationViolation[] =>
	A.filterMap(UNSAFE_STATEMENTS, (statement): TMigrationViolation | undefined =>
		match(line.toUpperCase().includes(statement))
			.with(false, (): undefined => undefined)
			.otherwise(
				(): TMigrationViolation => ({
					file,
					line: index + FIRST_LINE,
					statement,
					source: line.trim(),
					remedy: REMEDY[statement],
				}),
			),
	);

export const violationsFor = (
	file: string,
	contents: string,
): readonly TMigrationViolation[] =>
	match(isExempt(file, contents))
		.with(true, (): readonly TMigrationViolation[] => [])
		.otherwise((): readonly TMigrationViolation[] =>
			A.flat(
				A.mapWithIndex(contents.split("\n"), (index, line) =>
					matchesIn(file, line, index),
				),
			),
		);
