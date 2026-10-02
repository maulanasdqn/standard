import { A, O, S } from "@mobily/ts-belt";

const SEGMENT_SEPARATOR = "/";
const ROOT_SEGMENT = "";

export const listPathOf = (pathname: string): string => {
	const first = A.find(
		S.split(pathname, SEGMENT_SEPARATOR),
		(segment) => segment !== ROOT_SEGMENT,
	);
	return `${SEGMENT_SEPARATOR}${O.getWithDefault(first, ROOT_SEGMENT)}`;
};
