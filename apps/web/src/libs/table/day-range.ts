const DAY_START = "T00:00:00";
const DAY_END = "T23:59:59.999";

export type TDayRange = {
	dateFrom?: string;
	dateTo?: string;
};

const localInstant = (
	day: string | undefined,
	time: string,
): string | undefined =>
	day === undefined ? undefined : new Date(`${day}${time}`).toISOString();

export const dayRangeToInstants = (range: TDayRange): TDayRange => ({
	dateFrom: localInstant(range.dateFrom, DAY_START),
	dateTo: localInstant(range.dateTo, DAY_END),
});

export const withInstantRange = <TSearch extends TDayRange>(
	search: TSearch,
): TSearch => ({ ...search, ...dayRangeToInstants(search) });
