export const MAIL_MESSAGE = {
	GREETING: "Hi",
	SIGNATURE_PREFIX: "-",
	PASSWORD_RESET_SUBJECT: "Reset your password",
	PASSWORD_RESET_BODY:
		"Someone asked to reset the password for your account. Use the link below to choose a new one.",
	PASSWORD_RESET_ACTION: "Reset password",
	PASSWORD_RESET_EXPIRY:
		"This link expires in one hour. If you did not ask for it, you can safely ignore this email.",
	EMAIL_VERIFICATION_SUBJECT: "Confirm your email address",
	EMAIL_VERIFICATION_BODY:
		"Thanks for signing up. Confirm your email address to finish setting up your account.",
	EMAIL_VERIFICATION_ACTION: "Confirm email",
	EMAIL_VERIFICATION_EXPIRY:
		"This link expires in 24 hours. If you did not create an account, you can ignore this email.",
	PASSWORD_CHANGED_SUBJECT: "Your password was changed",
	PASSWORD_CHANGED_BODY:
		"The password for your account was just changed, and your other sessions were signed out.",
	PASSWORD_CHANGED_ACTION: "Reset password",
	PASSWORD_CHANGED_FOOTER:
		"If this was you, there is nothing else to do. If it was not, reset your password right away using the link above.",
	INVITE_SUBJECT: "You have been invited",
	INVITE_BODY:
		"An administrator created an account for you. Choose a password to start using it.",
	INVITE_ACTION: "Accept invitation",
	INVITE_EXPIRY:
		"This invitation expires in 7 days. If you were not expecting it, you can ignore this email.",
	ACCOUNT_DEACTIVATED_SUBJECT: "Your account was deactivated",
	ACCOUNT_DEACTIVATED_BODY:
		"An administrator deactivated your account, so you can no longer sign in and every session you had was signed out.",
	ACCOUNT_DEACTIVATED_FOOTER:
		"If you think this is a mistake, contact your administrator.",
	TWO_FACTOR_OFF_SUBJECT: "Two-factor authentication was turned off",
	TWO_FACTOR_OFF_BODY:
		"Two-factor authentication was just turned off for your account, so signing in now needs only your password.",
	TWO_FACTOR_OFF_ACTION: "Review your account",
	TWO_FACTOR_OFF_FOOTER:
		"If this was not you, change your password and turn two-factor authentication back on.",
	EMAIL_CHANGED_SUBJECT: "The email address on your account was changed",
	EMAIL_CHANGED_BODY:
		"An administrator changed the email address on your account, so you now sign in with the new address and every session you had was signed out.",
	EMAIL_CHANGED_NEW_ADDRESS: "New address:",
	EMAIL_CHANGED_FOOTER:
		"If you did not expect this, contact your administrator.",
	SEND_FAILED: "Could not send an email.",
	PASSWORD_RESET_FAILED: "Could not send the password reset email.",
} as const;
