import { PERMISSION, type TPermission } from "@app/permissions";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { GUARD_MODE, type TGuardMode, Guard } from "../guard.tsx";
import { PermissionsProvider } from "../permissions-provider.tsx";

const ALLOWED = "allowed";
const DENIED = "denied";

const guardWith = (
	granted: readonly TPermission[],
	required: readonly TPermission[],
	mode?: TGuardMode,
): ReactElement => (
	<PermissionsProvider permissions={granted}>
		<Guard permissions={required} mode={mode} fallback={<p>{DENIED}</p>}>
			<p>{ALLOWED}</p>
		</Guard>
	</PermissionsProvider>
);

describe("Guard", () => {
	afterEach(cleanup);

	it("renders the fallback when the permission is missing", (): void => {
		render(guardWith([], [PERMISSION.NOTE_WRITE]));

		expect(screen.queryByText(ALLOWED)).toBeNull();
		expect(screen.getByText(DENIED)).toBeTruthy();
	});

	it("renders the children once the permission is granted", (): void => {
		render(guardWith([PERMISSION.NOTE_WRITE], [PERMISSION.NOTE_WRITE]));

		expect(screen.getByText(ALLOWED)).toBeTruthy();
		expect(screen.queryByText(DENIED)).toBeNull();
	});

	it("requires every permission in the default all mode", (): void => {
		render(
			guardWith(
				[PERMISSION.NOTE_READ],
				[PERMISSION.NOTE_READ, PERMISSION.NOTE_WRITE],
			),
		);

		expect(screen.queryByText(ALLOWED)).toBeNull();
	});

	it("requires only one permission in any mode", (): void => {
		render(
			guardWith(
				[PERMISSION.NOTE_READ],
				[PERMISSION.NOTE_READ, PERMISSION.NOTE_WRITE],
				GUARD_MODE.ANY,
			),
		);

		expect(screen.getByText(ALLOWED)).toBeTruthy();
	});

	it("grants nothing outside a provider", (): void => {
		render(
			<Guard permissions={[PERMISSION.NOTE_READ]} fallback={<p>{DENIED}</p>}>
				<p>{ALLOWED}</p>
			</Guard>,
		);

		expect(screen.getByText(DENIED)).toBeTruthy();
	});
});
