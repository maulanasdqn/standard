import { NEWSLETTER_MESSAGE } from "@app/messages";
import { A } from "@mobily/ts-belt";
import { match, P } from "ts-pattern";
import {
	NEWSLETTER_HOOK,
	NEWSLETTER_STATE,
	type TNewsletterState,
} from "../lib/newsletter-hooks.ts";

const HTTP_TOO_MANY_REQUESTS = 429;
const JSON_CONTENT = "application/json";
const SUBMIT_BUTTON = "button[type='submit']";

type TOutcome = {
	readonly state: TNewsletterState;
	readonly message: string;
};

type TFormParts = {
	readonly form: HTMLFormElement;
	readonly status: HTMLElement;
	readonly button: HTMLButtonElement;
};

const FAILED: TOutcome = {
	state: NEWSLETTER_STATE.ERROR,
	message: NEWSLETTER_MESSAGE.FORM_ERROR,
};

const outcomeOf = (response: Response): TOutcome =>
	match({ ok: response.ok, status: response.status })
		.with(
			{ ok: true },
			(): TOutcome => ({
				state: NEWSLETTER_STATE.SUCCESS,
				message: NEWSLETTER_MESSAGE.FORM_SUCCESS,
			}),
		)
		.with(
			{ status: HTTP_TOO_MANY_REQUESTS },
			(): TOutcome => ({
				state: NEWSLETTER_STATE.ERROR,
				message: NEWSLETTER_MESSAGE.FORM_RATE_LIMITED,
			}),
		)
		.otherwise((): TOutcome => FAILED);

const send = (form: HTMLFormElement): Promise<Response> =>
	fetch(form.action, {
		method: "POST",
		headers: { "content-type": JSON_CONTENT, accept: JSON_CONTENT },
		body: JSON.stringify(Object.fromEntries(new FormData(form))),
	});

const setPending = (button: HTMLButtonElement, pending: boolean): void => {
	button.disabled = pending;
	button.textContent = pending
		? NEWSLETTER_MESSAGE.FORM_SUBMITTING
		: NEWSLETTER_MESSAGE.FORM_SUBMIT;
};

const submit = async (parts: TFormParts): Promise<void> => {
	setPending(parts.button, true);
	const outcome = await send(parts.form).then(
		outcomeOf,
		(): TOutcome => FAILED,
	);
	parts.status.dataset.state = outcome.state;
	parts.status.textContent = outcome.message;
	match(outcome.state)
		.with(NEWSLETTER_STATE.SUCCESS, (): void => parts.form.reset())
		.otherwise((): void => undefined);
	setPending(parts.button, false);
};

const enhance = (form: HTMLFormElement): void =>
	match({
		status: form.querySelector<HTMLElement>(`[${NEWSLETTER_HOOK.STATUS}]`),
		button: form.querySelector<HTMLButtonElement>(SUBMIT_BUTTON),
	})
		.with({ status: P.nonNullable, button: P.nonNullable }, (found): void =>
			form.addEventListener("submit", (event: SubmitEvent): void => {
				event.preventDefault();
				void submit({ form, status: found.status, button: found.button });
			}),
		)
		.otherwise((): void => undefined);

A.forEach(
	Array.from(
		document.querySelectorAll<HTMLFormElement>(`[${NEWSLETTER_HOOK.FORM}]`),
	),
	enhance,
);
