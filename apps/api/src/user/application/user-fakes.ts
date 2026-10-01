import { Layer } from "effect";
import { vi } from "vitest";
import {
	type TUserRepo,
	type TUserRepoId,
	UserRepo,
} from "#/user/domain/user.ts";
import {
	type TUserNotifier,
	type TUserNotifierId,
	UserNotifier,
} from "#/user/domain/user-notifier.ts";

export type { TUserNotifierId };

export const userRepoFake = (overrides: Partial<TUserRepo>): TUserRepo =>
	UserRepo.of({
		list: vi.fn(),
		findById: vi.fn(),
		findByEmail: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		remove: vi.fn(),
		resetPassword: vi.fn(),
		invite: vi.fn(),
		deactivate: vi.fn(),
		reactivate: vi.fn(),
		sessions: vi.fn(),
		sessionRevoke: vi.fn(),
		sessionsRevoke: vi.fn(),
		twoFactorReset: vi.fn(),
		...overrides,
	});

export const userNotifierFake = (
	overrides: Partial<TUserNotifier>,
): TUserNotifier =>
	UserNotifier.of({
		invite: vi.fn(),
		deactivated: vi.fn(),
		emailVerify: vi.fn(),
		twoFactorReset: vi.fn(),
		...overrides,
	});

export const userNotifierFakeLayer = (
	overrides: Partial<TUserNotifier> = {},
): Layer.Layer<TUserNotifierId> =>
	Layer.succeed(UserNotifier, userNotifierFake(overrides));

export const userRepoFakeLayer = (
	overrides: Partial<TUserRepo>,
): Layer.Layer<TUserRepoId> => Layer.succeed(UserRepo, userRepoFake(overrides));
