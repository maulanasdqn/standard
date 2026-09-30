export type TShowcaseOrb = {
	id: string;
	className: string;
	drift: readonly number[];
	rise: readonly number[];
	delay: number;
};

export const SHOWCASE_ORBS: readonly TShowcaseOrb[] = [
	{
		id: "orb-primary",
		className:
			"absolute -top-24 -left-16 size-96 rounded-full bg-primary/15 blur-3xl",
		drift: [0, 60, 0],
		rise: [0, 40, 0],
		delay: 0,
	},
	{
		id: "orb-accent",
		className:
			"absolute right-[-6rem] bottom-[-4rem] size-[28rem] rounded-full bg-primary/10 blur-3xl",
		drift: [0, -50, 0],
		rise: [0, -30, 0],
		delay: 1.2,
	},
	{
		id: "orb-muted",
		className:
			"absolute top-1/3 left-1/2 size-64 rounded-full bg-foreground/5 blur-2xl",
		drift: [0, 30, -20, 0],
		rise: [0, -40, 10, 0],
		delay: 2.4,
	},
];
