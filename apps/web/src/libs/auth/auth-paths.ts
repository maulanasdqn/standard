export const AUTH_PATH = {
	VERIFY_EMAIL: "/verify-email",
	RESET_PASSWORD: "/reset-password",
} as const;

export type TAuthPath = (typeof AUTH_PATH)[keyof typeof AUTH_PATH];

export const authCallbackUrl = (path: TAuthPath): string =>
	`${window.location.origin}${path}`;
