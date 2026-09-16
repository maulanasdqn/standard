export const ROLE_MESSAGE = {
	NOT_FOUND: "This role could not be found.",
	KEY_TAKEN: "A role with this key already exists.",
	FIXED: "Fixed roles are defined in code and can't be changed here.",
	IN_USE: "This role is still assigned to users and can't be deleted.",
	EMPTY: "No roles yet.",
	DELETE_CONFIRM_TITLE: "Delete this role?",
	DELETE_CONFIRM_DESCRIPTION: "The role will be removed permanently.",
	CREATE_CONFIRM_TITLE: "Create this role?",
	CREATE_CONFIRM_DESCRIPTION:
		"The role becomes assignable to users right away.",
	UPDATE_CONFIRM_TITLE: "Save these role changes?",
	UPDATE_CONFIRM_DESCRIPTION:
		"Every user with this role gets the new permissions immediately.",
	CREATED: "Role created.",
	UPDATED: "Role updated.",
	DELETED: "Role deleted.",
} as const;
