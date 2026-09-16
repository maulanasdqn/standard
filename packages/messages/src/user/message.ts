export const USER_MESSAGE = {
	NOT_FOUND: "This user could not be found.",
	EMAIL_TAKEN: "A user with this email already exists.",
	SELF_ROLE_CHANGE: "You can't change your own role.",
	SELF_DELETE: "You can't delete your own account.",
	SELF_PASSWORD_RESET: "Change your own password from your account page.",
	PASSWORD_RESET: "Password reset. Share the new password with the user.",
	EMPTY: "No users yet.",
	COLUMN_NAME: "Name",
	COLUMN_EMAIL: "Email",
	COLUMN_ROLE: "Role",
	COLUMN_CREATED: "Created",
	COLUMN_ACTIONS: "Actions",
	ACTION_EDIT: "Edit",
	CREATE_CONFIRM_TITLE: "Create this user?",
	CREATE_CONFIRM_DESCRIPTION:
		"The user can sign in with the given password right away.",
	UPDATE_CONFIRM_TITLE: "Save these user changes?",
	UPDATE_CONFIRM_DESCRIPTION: "The changes apply to the account immediately.",
	ROLE_CHANGE_CONFIRM_TITLE: "Change this user's role?",
	ROLE_CHANGE_CONFIRM_DESCRIPTION:
		"The user's permissions change on their next request.",
	PASSWORD_RESET_CONFIRM_TITLE: "Reset this user's password?",
	PASSWORD_RESET_CONFIRM_DESCRIPTION:
		"The current password stops working immediately.",
	CREATED: "User created.",
	UPDATED: "User updated.",
	DELETED: "User deleted.",
	DELETE_CONFIRM_TITLE: "Delete this user?",
	DELETE_CONFIRM_DESCRIPTION:
		"The account and its notes will be removed permanently.",
} as const;
