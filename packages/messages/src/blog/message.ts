export const BLOG_MESSAGE = {
	NAV_BLOG: "Blog",
	INDEX_TITLE: "Blog",
	INDEX_EYEBROW: "Guides and documentation",
	INDEX_HEADING: "Build on Standard",
	INDEX_DESCRIPTION:
		"Guides to running, extending and deploying Standard, written against the code they describe.",
	EMPTY: "No articles yet.",
	TAGGED: "Articles tagged",
	ALL_ARTICLES: "All articles",
	PUBLISHED: "Published",
	UPDATED: "Updated",
	TAGS: "Tags",
	RSS: "RSS",
	RSS_TITLE: "Standard blog",
} as const;

export const BLOG_TAG_LABEL: Readonly<Record<string, string>> = {
	"getting-started": "Getting started",
	modules: "Modules",
	deployment: "Deployment",
	testing: "Testing",
	operations: "Operations",
};
