export const ERROR_MESSAGE = {
	SERVER_UNREACHABLE_TITLE: "Can't reach the server",
	SERVER_UNREACHABLE_BODY:
		"You have not been signed out — this is a connection problem, so nothing has been lost.",
	SERVER_UNREACHABLE_NEXT:
		"Your session is still valid. Try again once the connection is back.",
	UNEXPECTED_TITLE: "Something went wrong",
	UNEXPECTED_BODY: "This page could not be loaded.",
	UNEXPECTED_NEXT: "Nothing was saved or lost. Try again.",
	NOT_FOUND_TITLE: "Page not found",
	NOT_FOUND_BODY: "That page doesn't exist, or it has moved.",
	RETRY: "Try again",
	RETRYING: "Retrying…",
	GO_HOME: "Back to home",
} as const;
