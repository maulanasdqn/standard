import { z } from "zod";

const dateTimeSchema = z.iso.datetime();

export type TBaseSchema<TId extends string = string> = {
	id: TId;
	createdAt: string;
	updatedAt: string;
};

export const baseSchema = <TId extends z.ZodType<string>>(
	idSchema: TId,
): z.ZodObject<{
	id: TId;
	createdAt: typeof dateTimeSchema;
	updatedAt: typeof dateTimeSchema;
}> =>
	z.object({
		id: idSchema,
		createdAt: dateTimeSchema,
		updatedAt: dateTimeSchema,
	});
