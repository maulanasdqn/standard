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
	SEND_FAILED: "Could not send an email.",
	PASSWORD_RESET_FAILED: "Could not send the password reset email.",
} as const;
