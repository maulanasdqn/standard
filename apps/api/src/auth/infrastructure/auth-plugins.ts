import { ROLE } from "@app/permissions";
import type { BetterAuthPlugin } from "better-auth";
import { jwt, twoFactor } from "better-auth/plugins";
import { match, P } from "ts-pattern";

const SECONDS_PER_DAY = 86_400;
const BACKUP_CODE_COUNT = 10;
const TRUSTED_DEVICE_SECONDS = 30 * SECONDS_PER_DAY;

export const JWT_POLICY = {
	EXPIRATION_TIME: "15m",
	KEY_ROTATION_SECONDS: 30 * SECONDS_PER_DAY,
	KEY_GRACE_SECONDS: 30 * SECONDS_PER_DAY,
} as const;

type TPermissionsFor = (role: string) => Promise<readonly string[]>;

type TAuthPluginsOptions = {
	appName: string;
	jwtEnabled: boolean;
	issuer: string;
	audience: string;
	permissionsFor: TPermissionsFor;
};

type TJwtPayload = {
	id: string;
	email: string;
	name: string;
	role: string;
	permissions: readonly string[];
};

type TJwtUser = {
	id: string;
	email: string;
	name: string;
	role?: unknown;
};

type TJwtPayloadSource = { user: TJwtUser };

type TDefinePayload = (source: TJwtPayloadSource) => Promise<TJwtPayload>;

const roleOf = (user: TJwtUser): string =>
	match(user.role)
		.with(P.string, (role): string => role)
		.otherwise((): string => ROLE.VIEWER);

const payloadOf =
	(permissionsFor: TPermissionsFor): TDefinePayload =>
	async (source): Promise<TJwtPayload> => {
		const role = roleOf(source.user);
		return {
			id: source.user.id,
			email: source.user.email,
			name: source.user.name,
			role,
			permissions: await permissionsFor(role),
		};
	};

const jwtPluginOf = (options: TAuthPluginsOptions): BetterAuthPlugin =>
	jwt({
		disableSettingJwtHeader: true,
		jwks: {
			rotationInterval: JWT_POLICY.KEY_ROTATION_SECONDS,
			gracePeriod: JWT_POLICY.KEY_GRACE_SECONDS,
		},
		jwt: {
			issuer: options.issuer,
			audience: options.audience,
			expirationTime: JWT_POLICY.EXPIRATION_TIME,
			definePayload: payloadOf(options.permissionsFor),
		},
	});

const twoFactorPluginOf = (issuer: string): BetterAuthPlugin =>
	twoFactor({
		issuer,
		backupCodeOptions: { amount: BACKUP_CODE_COUNT },
		trustDeviceMaxAge: TRUSTED_DEVICE_SECONDS,
	});

export const authPluginsOf = (
	options: TAuthPluginsOptions,
): BetterAuthPlugin[] => [
	twoFactorPluginOf(options.appName),
	...match(options.jwtEnabled)
		.with(false, (): BetterAuthPlugin[] => [])
		.otherwise((): BetterAuthPlugin[] => [jwtPluginOf(options)]),
];
