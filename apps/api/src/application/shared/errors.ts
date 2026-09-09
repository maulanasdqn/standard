export type TAppErrorCode =
	| "NOT_FOUND"
	| "FORBIDDEN"
	| "UNAUTHORIZED"
	| "BAD_REQUEST";

export class AppError extends Error {
	readonly code: TAppErrorCode;

	constructor(code: TAppErrorCode, message: string) {
		super(message);
		this.code = code;
		this.name = "AppError";
	}
}

export const notFound = (message: string): AppError =>
	new AppError("NOT_FOUND", message);
export const forbidden = (message: string): AppError =>
	new AppError("FORBIDDEN", message);
