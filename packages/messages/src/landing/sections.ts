export type TLandingEntry = {
	readonly title: string;
	readonly body: string;
};

export type TLandingStackGroup = {
	readonly title: string;
	readonly items: readonly string[];
};

export const LANDING_FEATURES: readonly TLandingEntry[] = [
	{
		title: "Accounts that are finished",
		body: "Sign-up with email confirmation, password reset, invitations, sessions you can see and revoke, and two-factor sign-in with backup codes.",
	},
	{
		title: "Roles and permissions",
		body: "One role per user, permissions checked on the server and mirrored in the interface, and nobody can grant more than they hold.",
	},
	{
		title: "An activity log",
		body: "Who created, changed or deleted what, and when, recorded across modules and kept for a set number of days.",
	},
	{
		title: "Jobs, mail and files",
		body: "RabbitMQ workers with retry and dead-letter queues, mail over SMTP, and uploads to any S3 compatible store.",
	},
	{
		title: "Observable from day one",
		body: "Structured logs, Prometheus metrics, OpenTelemetry tracing, and liveness and readiness probes.",
	},
	{
		title: "Boundaries that hold",
		body: "Each API module is reached only through its index, and the build fails when an import crosses a layer it should not.",
	},
];

export const LANDING_STACK: readonly TLandingStackGroup[] = [
	{
		title: "API",
		items: ["Hono", "oRPC", "Effect", "Drizzle", "PostgreSQL"],
	},
	{
		title: "Web",
		items: ["React 19", "TanStack Router", "TanStack Query", "Vite"],
	},
	{
		title: "Services",
		items: ["Redis", "RabbitMQ", "S3 compatible storage", "SMTP"],
	},
	{
		title: "Tooling",
		items: ["moon", "pnpm", "Biome", "Vitest", "Playwright"],
	},
];

export const LANDING_STEPS: readonly TLandingEntry[] = [
	{
		title: "Clone and set up",
		body: "One command starts Postgres, Redis, RabbitMQ, mail and file storage on your machine, then migrates and seeds the database.",
	},
	{
		title: "Copy a module",
		body: "Notes is the reference module: domain, use cases, storage and routes, with every touchpoint a new module needs listed in one document.",
	},
	{
		title: "Ship one image",
		body: "One container serves the API, the app and this page, and every build reports its own version.",
	},
];

export const LANDING_FAQ: readonly TLandingEntry[] = [
	{
		title: "Do I have to keep every part?",
		body: "This page is optional and turned on by one setting. The API expects Postgres, Redis, RabbitMQ and an object store, and checks its settings at boot rather than failing later in a request.",
	},
	{
		title: "How do I add a feature?",
		body: "Copy the notes module and follow the module guide, which lists every file a new module, endpoint or permission touches, including the ones a directory listing does not show.",
	},
	{
		title: "How is it tested?",
		body: "Unit tests run with Vitest, and the API and the app each have an end-to-end suite that CI runs on every pull request.",
	},
	{
		title: "Where does it run?",
		body: "Anywhere a container runs. The image holds the API, the app and this page, and the background worker runs from the same image.",
	},
];
