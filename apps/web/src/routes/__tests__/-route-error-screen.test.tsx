import { ERROR_MESSAGE } from "@app/messages";
import { ORPCError } from "@orpc/client";
import { cleanup, render, screen } from "@testing-library/react";
import type { PropsWithChildren, ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EForbidden } from "#/libs/auth/forbidden.ts";
import { ORPC_ERROR_CODE } from "#/libs/orpc/record-not-found.ts";
import { RouteErrorScreen } from "#/routes/_components/route-error-screen.tsx";

const DETAIL_PATH = "/users/abc/edit";
const LIST_PATH = "/users";

type TLinkProps = PropsWithChildren<{ to: string }>;
type TRouterState = {
	location: { pathname: string };
	isLoading: boolean;
};

vi.mock("@tanstack/react-router", () => ({
	Link: (props: TLinkProps): ReactElement => (
		<a href={props.to}>{props.children}</a>
	),
	useRouter: (): { invalidate: () => Promise<void> } => ({
		invalidate: async (): Promise<void> => undefined,
	}),
	useRouterState: <TSelected,>(options: {
		select: (state: TRouterState) => TSelected;
	}): TSelected =>
		options.select({ location: { pathname: DETAIL_PATH }, isLoading: false }),
}));

const renderFor = (error: Error): void => {
	render(<RouteErrorScreen error={error} reset={(): void => undefined} />);
};

describe("RouteErrorScreen", () => {
	afterEach(cleanup);

	it("explains a missing record and links back to its list", (): void => {
		renderFor(new ORPCError(ORPC_ERROR_CODE.NOT_FOUND));

		expect(
			screen.getByRole("heading", {
				name: ERROR_MESSAGE.RECORD_NOT_FOUND_TITLE,
			}),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: ERROR_MESSAGE.BACK_TO_LIST }),
		).toHaveAttribute("href", LIST_PATH);
	});

	it("sends a forbidden viewer home", (): void => {
		renderFor(new EForbidden());

		expect(
			screen.getByRole("heading", { name: ERROR_MESSAGE.FORBIDDEN_TITLE }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: ERROR_MESSAGE.GO_HOME }),
		).toBeInTheDocument();
	});

	it("offers a retry for anything else", (): void => {
		renderFor(new Error(ERROR_MESSAGE.UNEXPECTED_TITLE));

		expect(
			screen.getByRole("heading", { name: ERROR_MESSAGE.UNEXPECTED_TITLE }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: ERROR_MESSAGE.RETRY }),
		).toBeInTheDocument();
	});
});
