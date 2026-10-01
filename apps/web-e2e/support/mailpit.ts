const MAILPIT_URL = process.env.MAILPIT_URL ?? "http://localhost:8025";
const POLL_ATTEMPTS = 40;
const POLL_INTERVAL_MS = 250;

type TMailSummary = { ID: string };
type TMailSearch = { messages: TMailSummary[] };
type TMailMessage = { Subject: string; Text: string };

const sleep = (ms: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms));

const latestMessage = async (to: string): Promise<TMailMessage | null> => {
	const search = (await (
		await fetch(
			`${MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:${to}`)}`,
		)
	).json()) as TMailSearch;
	const [first] = search.messages;
	return first === undefined
		? null
		: ((await (
				await fetch(`${MAILPIT_URL}/api/v1/message/${first.ID}`)
			).json()) as TMailMessage);
};

export const mailCount = async (to: string): Promise<number> => {
	const search = (await (
		await fetch(
			`${MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:${to}`)}`,
		)
	).json()) as TMailSearch;
	return search.messages.length;
};

export const mailLinkWait = async (
	to: string,
	pattern: RegExp,
	after = 0,
): Promise<string> => {
	for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
		const link =
			(await mailCount(to)) > after
				? (await latestMessage(to))?.Text.match(pattern)?.[0]
				: undefined;
		if (link !== undefined) {
			return link;
		}
		await sleep(POLL_INTERVAL_MS);
	}
	throw new Error(`No mail with a matching link reached ${to}`);
};
