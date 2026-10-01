const MOBILE_AGENT = /mobi|tablet/i;

export const DEVICE_KIND = {
	DESKTOP: "desktop",
	MOBILE: "mobile",
} as const;

export type TDeviceKind = (typeof DEVICE_KIND)[keyof typeof DEVICE_KIND];

export const deviceKindOf = (
	userAgent: string | null | undefined,
): TDeviceKind =>
	MOBILE_AGENT.test(userAgent ?? "") ? DEVICE_KIND.MOBILE : DEVICE_KIND.DESKTOP;
