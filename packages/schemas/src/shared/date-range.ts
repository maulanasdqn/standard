import { z } from "zod";

export const daySchema = z.iso.date();
export const instantSchema = z.iso.datetime({ offset: true });

export const dayRangeShape = {
	dateFrom: daySchema.optional(),
	dateTo: daySchema.optional(),
};

export const instantRangeShape = {
	dateFrom: instantSchema.optional(),
	dateTo: instantSchema.optional(),
};
