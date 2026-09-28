import { ACTIVITY_DETAIL, type TActivityDetail } from "@app/activity";
import { formatBytes, NOT_SET } from "@app/format";
import { ACTIVITY_DETAIL_LABEL } from "@app/messages";
import type { TActivity } from "@app/schemas";
import { A, D } from "@mobily/ts-belt";
import { match, P } from "ts-pattern";

type TDetailValue = string | number | boolean | null;

type TShownDetail = keyof typeof ACTIVITY_DETAIL_LABEL;

type TDetailSpec = {
	key: TShownDetail;
	previous?: TActivityDetail;
	format?: (value: TDetailValue) => string;
};

const PART_SEPARATOR = " · ";
const KEY_VALUE_SEPARATOR = ": ";
const CHANGE_ARROW = " → ";

const bytesOf = (value: TDetailValue): string =>
	match(value)
		.with(P.number, (bytes): string => formatBytes(bytes))
		.otherwise((other): string => String(other));

const DETAIL_ORDER: readonly TDetailSpec[] = [
	{ key: ACTIVITY_DETAIL.LABEL, previous: ACTIVITY_DETAIL.PREVIOUS_LABEL },
	{ key: ACTIVITY_DETAIL.TITLE },
	{ key: ACTIVITY_DETAIL.EMAIL },
	{ key: ACTIVITY_DETAIL.NAME, previous: ACTIVITY_DETAIL.PREVIOUS_NAME },
	{ key: ACTIVITY_DETAIL.ROLE, previous: ACTIVITY_DETAIL.PREVIOUS_ROLE },
	{ key: ACTIVITY_DETAIL.PERMISSION_COUNT },
	{ key: ACTIVITY_DETAIL.PERMISSIONS_ADDED },
	{ key: ACTIVITY_DETAIL.PERMISSIONS_REMOVED },
	{ key: ACTIVITY_DETAIL.FILE_NAME },
	{ key: ACTIVITY_DETAIL.BYTE_SIZE, format: bytesOf },
	{ key: ACTIVITY_DETAIL.CHANGED_FIELDS },
];

type TMetadata = NonNullable<TActivity["metadata"]>;

const detailValueOf = (
	metadata: TMetadata,
	spec: TDetailSpec,
	value: TDetailValue,
): string => {
	const format = spec.format ?? String;
	const previous = match(spec.previous)
		.with(P.string, (key): TDetailValue | undefined => D.get(metadata, key))
		.otherwise((): undefined => undefined);

	return match(previous)
		.with(P.nullish, (): string => format(value))
		.otherwise(
			(before): string => `${format(before)}${CHANGE_ARROW}${format(value)}`,
		);
};

const partOf = (metadata: TMetadata, spec: TDetailSpec): readonly string[] =>
	match(D.get(metadata, spec.key))
		.with(P.nullish, (): readonly string[] => [])
		.otherwise((value): readonly string[] => [
			`${ACTIVITY_DETAIL_LABEL[spec.key]}${KEY_VALUE_SEPARATOR}${detailValueOf(metadata, spec, value)}`,
		]);

export const metadataLabel = (metadata: TActivity["metadata"]): string =>
	match(metadata)
		.with(P.nullish, (): string => NOT_SET)
		.otherwise((found): string =>
			match(A.flat(A.map(DETAIL_ORDER, (spec) => partOf(found, spec))))
				.when(A.isEmpty, (): string => NOT_SET)
				.otherwise((parts): string => A.join(parts, PART_SEPARATOR)),
		);
