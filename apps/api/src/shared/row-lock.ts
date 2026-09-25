export const ROW_LOCK = {
	UPDATE: "update",
	SHARE: "share",
} as const;

export type TRowLock = (typeof ROW_LOCK)[keyof typeof ROW_LOCK];
