export type INoteRow = {
	id: string;
	title: string;
	body: string;
	authorId: string;
	createdAt: Date;
	updatedAt: Date;
};

export type INoteQuery = {
	page: number;
	pageSize: number;
	search?: string;
};

export type INoteRepo = {
	list: (query: INoteQuery) => Promise<{ items: INoteRow[]; total: number }>;
	findById: (id: string) => Promise<INoteRow | null>;
	create: (input: {
		title: string;
		body: string;
		authorId: string;
	}) => Promise<INoteRow>;
	update: (
		id: string,
		input: { title?: string; body?: string },
	) => Promise<INoteRow | null>;
	remove: (id: string) => Promise<boolean>;
};
