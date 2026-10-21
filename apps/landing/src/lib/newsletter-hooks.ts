export const NEWSLETTER_HOOK = {
	FORM: "data-newsletter-form",
	STATUS: "data-newsletter-status",
} as const;

export const NEWSLETTER_FIELD = {
	EMAIL: "email",
	SOURCE: "source",
} as const;

export const NEWSLETTER_STATE = {
	SUCCESS: "success",
	ERROR: "error",
} as const;

export type TNewsletterState =
	(typeof NEWSLETTER_STATE)[keyof typeof NEWSLETTER_STATE];
