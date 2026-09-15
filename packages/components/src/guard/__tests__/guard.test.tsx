import { PERMISSION, type TPermission } from "@app/permissions";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { GUARD_MODE, type TGuardMode, Guard } from "../guard.tsx";
import { clearPermissions, setPermissions } from "../permissions-store.ts";

const ALLOWED = "allowed";
const DENIED = "denied";

const guardWith = (
	permissions: readonly TPermission[],
	mode?: TGuardMode,
): ReactElement => (
	<Guard permissions={permissions} mode={mode} fallback={<p>{DENIED}</p>}>
		<p>{ALLOWED}</p>
	</Guard>
);

describe("Guard", () => {
	afterEach((): void => {
		cleanup();
		clearPermissions();
	});

	it("renders the fallback when the permission is missing", (): void => {
		render(guardWith([PERMISSION.NOTE_WRITE]));

		expect(screen.queryByText(ALLOWED)).toBeNull();
		expect(screen.getByText(DENIED)).toBeTruthy();
	});

	it("renders the children once the permission is granted", (): void => {
		setPermissions([PERMISSION.NOTE_WRITE]);
		render(guardWith([PERMISSION.NOTE_WRITE]));

		expect(screen.getByText(ALLOWED)).toBeTruthy();
		expect(screen.queryByText(DENIED)).toBeNull();
	});

	it("requires every permission in the default all mode", (): void => {
		setPermissions([PERMISSION.NOTE_READ]);
		render(guardWith([PERMISSION.NOTE_READ, PERMISSION.NOTE_WRITE]));

		expect(screen.queryByText(ALLOWED)).toBeNull();
	});

	it("requires only one permission in any mode", (): void => {
		setPermissions([PERMISSION.NOTE_READ]);
		render(
			guardWith([PERMISSION.NOTE_READ, PERMISSION.NOTE_WRITE], GUARD_MODE.ANY),
		);

		expect(screen.getByText(ALLOWED)).toBeTruthy();
	});
});
