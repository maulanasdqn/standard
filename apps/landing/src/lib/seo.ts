import { APP_MESSAGE, LANDING_MESSAGE } from "@app/messages";

export const LANGUAGE = "en";
export const THEME_COLOR = "#1a1a1a";
export const OG_TYPE = "website";
export const TWITTER_CARD = "summary";

export const ROBOTS_META = {
	INDEX: "index, follow",
	NOINDEX: "noindex, follow",
} as const;

const SCHEMA_CONTEXT = "https://schema.org";
const SCHEMA_TYPE_WEBSITE = "WebSite";
const LESS_THAN = "<";
const LESS_THAN_ESCAPED = "\\u003c";

export type TWebsiteSchema = {
	readonly "@context": string;
	readonly "@type": string;
	readonly name: string;
	readonly url: string;
	readonly description: string;
	readonly inLanguage: string;
};

export const websiteSchemaOf = (siteUrl: string): TWebsiteSchema => ({
	"@context": SCHEMA_CONTEXT,
	"@type": SCHEMA_TYPE_WEBSITE,
	name: APP_MESSAGE.NAME,
	url: siteUrl,
	description: LANDING_MESSAGE.META_DESCRIPTION,
	inLanguage: LANGUAGE,
});

export const jsonLdOf = (schema: TWebsiteSchema): string =>
	JSON.stringify(schema).replaceAll(LESS_THAN, LESS_THAN_ESCAPED);
