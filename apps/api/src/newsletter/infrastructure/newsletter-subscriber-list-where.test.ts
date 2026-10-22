import {
	NEWSLETTER_SORT,
	NEWSLETTER_STATUS,
	SORT_DIRECTION,
	type TNewsletterSubscriberListInput,
} from "@app/schemas";
import { PgDialect } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import { newsletterSubscriberListWhere } from "#/newsletter/infrastructure/newsletter-subscriber-list-where.ts";

const SEARCH = "reader";
const BASE: TNewsletterSubscriberListInput = {
	page: 1,
	pageSize: 20,
	sortBy: NEWSLETTER_SORT.CREATED_AT,
	sortDir: SORT_DIRECTION.DESC,
};
const dialect = new PgDialect();

const renderedFor = (
	patch: Partial<TNewsletterSubscriberListInput>,
): { sql: string; params: unknown[] } | undefined => {
	const where = newsletterSubscriberListWhere({ ...BASE, ...patch });
	return where === undefined ? undefined : dialect.sqlToQuery(where);
};

describe("newsletterSubscriberListWhere", () => {
	it("adds no condition when neither a search nor a status is given", (): void => {
		expect(renderedFor({})).toBeUndefined();
	});

	it("matches the search anywhere in the email, case-insensitively", (): void => {
		const rendered = renderedFor({ search: SEARCH });

		expect(rendered?.sql).toContain('"email" ilike');
		expect(rendered?.params).toEqual([`%${SEARCH}%`]);
	});

	it("keeps only subscribers in the requested status", (): void => {
		const rendered = renderedFor({ status: NEWSLETTER_STATUS.CONFIRMED });

		expect(rendered?.sql).toContain('"status" =');
		expect(rendered?.params).toEqual([NEWSLETTER_STATUS.CONFIRMED]);
	});

	it("requires both when a search and a status are given", (): void => {
		const rendered = renderedFor({
			search: SEARCH,
			status: NEWSLETTER_STATUS.UNSUBSCRIBED,
		});

		expect(rendered?.sql).toContain(" and ");
		expect(rendered?.params).toEqual([
			`%${SEARCH}%`,
			NEWSLETTER_STATUS.UNSUBSCRIBED,
		]);
	});
});
