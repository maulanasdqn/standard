import {
	ACTIVITY_ACTION,
	ACTIVITY_DETAIL,
	ACTIVITY_RESOURCE_TYPE,
	activityDetails,
	type TActivityEntry,
	type TActivityRepo,
} from "@app/activity";
import {
	MAIL_TEMPLATE,
	mailSendSafe,
	passwordChangedMailBuild,
	twoFactorOffMailBuild,
	type TMailer,
} from "@app/mail";
import { APP_MESSAGE } from "@app/messages";
import { logger } from "#/platform/observability/logger.ts";

const FORGOT_PASSWORD_PATH = "/forgot-password";
const ACCOUNT_PATH = "/account";
const AUTH_EVENT_FAILED = "auth.event.record_failed";

export type TAuthEventUser = {
	id: string;
	email: string;
	name: string;
};

type TAuthEventsDeps = {
	activityRepo: TActivityRepo;
	mailer: TMailer;
	webOrigin: string;
};

export type TAuthEvents = {
	signedUp: (user: TAuthEventUser) => Promise<void>;
	signInFailed: (email: string) => Promise<void>;
	signedOut: (userId: string, sessionId: string) => Promise<void>;
	emailVerified: (user: TAuthEventUser) => Promise<void>;
	profileUpdated: (
		userId: string,
		name: string,
		previousName: string,
	) => Promise<void>;
	passwordChanged: (user: TAuthEventUser) => Promise<void>;
	passwordRecovered: (user: TAuthEventUser) => Promise<void>;
	sessionsRevoked: (userId: string, sessionId: string) => Promise<void>;
	twoFactorEnabled: (user: TAuthEventUser) => Promise<void>;
	twoFactorDisabled: (user: TAuthEventUser) => Promise<void>;
};

export const authEventsOf = (deps: TAuthEventsDeps): TAuthEvents => {
	const record = (entry: TActivityEntry): Promise<void> =>
		deps.activityRepo.insert(entry).catch((cause: unknown): void => {
			logger.error({
				event: AUTH_EVENT_FAILED,
				action: entry.action,
				err: cause,
			});
		});

	const userEntry = (
		action: TActivityEntry["action"],
		user: TAuthEventUser,
	): TActivityEntry => ({
		actorId: user.id,
		action,
		resourceType: ACTIVITY_RESOURCE_TYPE.USER,
		resourceId: user.id,
		metadata: activityDetails({ [ACTIVITY_DETAIL.EMAIL]: user.email }),
	});

	const passwordChangedMail = async (user: TAuthEventUser): Promise<void> => {
		await mailSendSafe(
			deps.mailer,
			logger,
			MAIL_TEMPLATE.PASSWORD_CHANGED,
			passwordChangedMailBuild({
				to: user.email,
				name: user.name,
				resetUrl: `${deps.webOrigin}${FORGOT_PASSWORD_PATH}`,
				brand: APP_MESSAGE.NAME,
			}),
		);
	};

	const sessionEntry = (
		action: TActivityEntry["action"],
		userId: string,
		sessionId: string,
	): TActivityEntry => ({
		actorId: userId,
		action,
		resourceType: ACTIVITY_RESOURCE_TYPE.SESSION,
		resourceId: sessionId,
	});

	return {
		signedUp: (user) => record(userEntry(ACTIVITY_ACTION.USER_SIGN_UP, user)),
		signInFailed: (email) =>
			record({
				actorId: null,
				action: ACTIVITY_ACTION.SESSION_FAIL,
				resourceType: ACTIVITY_RESOURCE_TYPE.SESSION,
				resourceId: email,
				metadata: activityDetails({ [ACTIVITY_DETAIL.EMAIL]: email }),
			}),
		signedOut: (userId, sessionId) =>
			record(sessionEntry(ACTIVITY_ACTION.SESSION_DELETE, userId, sessionId)),
		emailVerified: (user) =>
			record(userEntry(ACTIVITY_ACTION.USER_EMAIL_VERIFY, user)),
		profileUpdated: (userId, name, previousName) =>
			record({
				actorId: userId,
				action: ACTIVITY_ACTION.USER_PROFILE_UPDATE,
				resourceType: ACTIVITY_RESOURCE_TYPE.USER,
				resourceId: userId,
				metadata: activityDetails({
					[ACTIVITY_DETAIL.NAME]: name,
					[ACTIVITY_DETAIL.PREVIOUS_NAME]: previousName,
				}),
			}),
		passwordChanged: async (user) => {
			await record(userEntry(ACTIVITY_ACTION.USER_PASSWORD_CHANGE, user));
			await passwordChangedMail(user);
		},
		passwordRecovered: async (user) => {
			await record(userEntry(ACTIVITY_ACTION.USER_PASSWORD_RECOVER, user));
			await passwordChangedMail(user);
		},
		sessionsRevoked: (userId, sessionId) =>
			record(sessionEntry(ACTIVITY_ACTION.SESSION_REVOKE, userId, sessionId)),
		twoFactorEnabled: (user) =>
			record(userEntry(ACTIVITY_ACTION.USER_TWO_FACTOR_ENABLE, user)),
		twoFactorDisabled: async (user) => {
			await record(userEntry(ACTIVITY_ACTION.USER_TWO_FACTOR_DISABLE, user));
			await mailSendSafe(
				deps.mailer,
				logger,
				MAIL_TEMPLATE.TWO_FACTOR_OFF,
				twoFactorOffMailBuild({
					to: user.email,
					name: user.name,
					accountUrl: `${deps.webOrigin}${ACCOUNT_PATH}`,
					brand: APP_MESSAGE.NAME,
				}),
			);
		},
	};
};
