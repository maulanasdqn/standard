const SIGN_UP_SETTING = { ENABLED: "true" } as const;

export const signUpEnabledOf = (value: string | undefined): boolean =>
	value?.trim().toLowerCase() === SIGN_UP_SETTING.ENABLED;

export const SIGN_UP_ENABLED: boolean = signUpEnabledOf(
	import.meta.env.VITE_AUTH_SIGN_UP_ENABLED,
);
