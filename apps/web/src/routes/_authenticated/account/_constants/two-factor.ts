export const TWO_FACTOR_STEP = {
	IDLE: "idle",
	PASSWORD: "password",
	SETUP: "setup",
	CODES: "codes",
} as const;

export type TTwoFactorStep =
	(typeof TWO_FACTOR_STEP)[keyof typeof TWO_FACTOR_STEP];

export const TWO_FACTOR_ACTION = {
	ENABLE: "enable",
	DISABLE: "disable",
	REGENERATE: "regenerate",
} as const;

export type TTwoFactorAction =
	(typeof TWO_FACTOR_ACTION)[keyof typeof TWO_FACTOR_ACTION];
