import { APP_MESSAGE, LANDING_MESSAGE } from "@app/messages";

export const LANGUAGE = "en";
export const THEME_COLOR = "#1a1a1a";
export const TWITTER_CARD = "summary";
export const TITLE_SEPARATOR = " · ";

export const OG_TYPE = {
	WEBSITE: "website",
	ARTICLE: "article",
} as const;

export type TOgType = (typeof OG_TYPE)[keyof typeof OG_TYPE];

export const ROBOTS_META = {
	INDEX: "index, follow",
	NOINDEX: "noindex, follow",
} as const;

const SCHEMA_CONTEXT = "https://schema.org";
const LESS_THAN = "<";
const LESS_THAN_ESCAPED = "\\u003c";

const SCHEMA_TYPE = {
	WEBSITE: "WebSite",
	ARTICLE: "BlogPosting",
	ORGANIZATION: "Organization",
} as const;

export type TOrganizationNode = {
	readonly "@type": typeof SCHEMA_TYPE.ORGANIZATION;
	readonly name: string;
};

export type TWebsiteNode = {
	readonly "@type": typeof SCHEMA_TYPE.WEBSITE;
	readonly name: string;
	readonly url: string;
	readonly description: string;
	readonly inLanguage: string;
};

export type TArticleNode = {
	readonly "@type": typeof SCHEMA_TYPE.ARTICLE;
	readonly headline: string;
	readonly description: string;
	readonly url: string;
	readonly datePublished: string;
	readonly dateModified: string;
	readonly inLanguage: string;
	readonly author: TOrganizationNode;
	readonly publisher: TOrganizationNode;
};

export type TSchemaNode = TWebsiteNode | TArticleNode;

export type TArticleInput = {
	readonly title: string;
	readonly description: string;
	readonly url: string;
	readonly publishedAt: Date;
	readonly updatedAt: Date | undefined;
};

const organization: TOrganizationNode = {
	"@type": SCHEMA_TYPE.ORGANIZATION,
	name: APP_MESSAGE.NAME,
};

export const websiteNodeOf = (siteUrl: string): TWebsiteNode => ({
	"@type": SCHEMA_TYPE.WEBSITE,
	name: APP_MESSAGE.NAME,
	url: siteUrl,
	description: LANDING_MESSAGE.META_DESCRIPTION,
	inLanguage: LANGUAGE,
});

export const articleNodeOf = (article: TArticleInput): TArticleNode => ({
	"@type": SCHEMA_TYPE.ARTICLE,
	headline: article.title,
	description: article.description,
	url: article.url,
	datePublished: article.publishedAt.toISOString(),
	dateModified: (article.updatedAt ?? article.publishedAt).toISOString(),
	inLanguage: LANGUAGE,
	author: organization,
	publisher: organization,
});

export const pageTitleOf = (title: string): string =>
	`${title}${TITLE_SEPARATOR}${APP_MESSAGE.NAME}`;

export const jsonLdOf = (nodes: readonly TSchemaNode[]): string =>
	JSON.stringify({ "@context": SCHEMA_CONTEXT, "@graph": nodes }).replaceAll(
		LESS_THAN,
		LESS_THAN_ESCAPED,
	);
