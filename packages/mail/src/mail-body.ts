import { A } from "@mobily/ts-belt";

const PARAGRAPH_SEPARATOR = "\n\n";
const NO_SEPARATOR = "";

const HTML_ESCAPE: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
};

const HTML_SPECIAL = /[&<>"']/g;

export const mailEscape = (value: string): string =>
	value.replace(HTML_SPECIAL, (found): string => HTML_ESCAPE[found] ?? found);

export const mailTextBuild = (lines: readonly string[]): string =>
	A.join(lines, PARAGRAPH_SEPARATOR);

export const mailHtmlBuild = (lines: readonly string[]): string =>
	A.join(
		A.map(lines, (line): string => `<p>${line}</p>`),
		NO_SEPARATOR,
	);

export const mailLinkBuild = (label: string, url: string): string =>
	`<a href="${mailEscape(url)}">${mailEscape(label)}</a>`;
