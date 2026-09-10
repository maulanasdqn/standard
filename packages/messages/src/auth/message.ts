export const AUTH_MESSAGE = {
	UNAUTHORIZED: "Please sign in to continue.",
	FORBIDDEN: "You don't have permission to perform this action.",
	INVALID_CREDENTIALS: "That email or password is incorrect.",
	PASSWORD_CHANGED: "Password updated. Your other sessions were signed out.",
	PASSWORD_CHANGE_FAILED: "Could not change your password.",
	PASSWORDS_MISMATCH: "Passwords don't match.",
} as const;
