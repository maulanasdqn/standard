export const AUTH_MESSAGE = {
	UNAUTHORIZED: "Please sign in to continue.",
	FORBIDDEN: "You don't have permission to perform this action.",
	INVALID_CREDENTIALS: "That email or password is incorrect.",
	PASSWORD_CHANGED: "Password updated. Your other sessions were signed out.",
	PASSWORD_CHANGE_FAILED: "Could not change your password.",
	PASSWORD_CHANGE_CONFIRM_TITLE: "Change your password?",
	PASSWORD_CHANGE_CONFIRM_DESCRIPTION:
		"Your other sessions will be signed out.",
	PASSWORDS_MISMATCH: "Passwords don't match.",
	SESSION_UNVERIFIED:
		"Sign-in succeeded, but the session could not be verified. Please try again.",
	SESSION_UNREACHABLE:
		"Sign-in succeeded, but the server is unreachable. You are still signed in, so try again once the connection is back.",
} as const;
