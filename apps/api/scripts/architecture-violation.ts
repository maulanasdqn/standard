export type TViolation = {
	file: string;
	line: number;
	rule: string;
	edge: string;
	specifier: string;
	remedy: string;
};

export type TViolationSite = Pick<TViolation, "file" | "line" | "specifier">;

export const RULE = {
	UNCLASSIFIED_PATH: "unclassified-path",
	MODULE_LAYER: "module-layer",
	LAYER_BOUNDARY: "layer-boundary",
	MODULE_ISOLATION: "module-isolation",
	AREA_BOUNDARY: "area-boundary",
	PATH_ESCAPE: "path-escape",
	UNCHECKED_SPECIFIER: "unchecked-specifier",
} as const;
