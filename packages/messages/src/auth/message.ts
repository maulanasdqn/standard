export const AUTH_MESSAGE = {
	UNAUTHORIZED: "Please sign in to continue.",
	SIGN_OUT_FAILED:
		"Could not sign you out. You are still signed in on this device, so try again.",
	SESSION_UNAVAILABLE:
		"We could not check your session just now. You have not been signed out, so try again in a moment.",
	FORBIDDEN: "You don't have permission to perform this action.",
	INVALID_CREDENTIALS: "That email or password is incorrect.",
	SIGN_IN_FAILED: "Could not sign you in just now. Please try again.",
	PASSWORD_CHANGED: "Password updated. Your other sessions were signed out.",
	PASSWORD_CHANGE_FAILED: "Could not change your password.",
	CURRENT_PASSWORD_INCORRECT: "Your current password is incorrect.",
	PASSWORD_UPDATE: "Update password",
	PASSWORD_UPDATING: "Updating…",
	PASSWORD_CHANGE_CONFIRM_TITLE: "Change your password?",
	PASSWORD_CHANGE_CONFIRM_DESCRIPTION:
		"Your other sessions will be signed out.",
	PASSWORDS_MISMATCH: "Passwords don't match.",
	EMAIL_PLACEHOLDER: "m@example.com",
	PASSWORD_PLACEHOLDER: "Your password",
	CURRENT_PASSWORD_PLACEHOLDER: "Your current password",
	NEW_PASSWORD_PLACEHOLDER: "At least 8 characters",
	CONFIRM_PASSWORD_PLACEHOLDER: "Repeat the new password",
	SESSION_UNVERIFIED:
		"Sign-in succeeded, but the session could not be verified. Please try again.",
	SESSION_UNREACHABLE:
		"Sign-in succeeded, but the server is unreachable. You are still signed in, so try again once the connection is back.",
} as const;
