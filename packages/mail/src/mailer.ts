import { createTransport } from "nodemailer";

export type TMailMessage = {
	to: string;
	subject: string;
	text: string;
	html: string;
};

export type TMailer = {
	send: (message: TMailMessage) => Promise<void>;
};

export type TMailerOptions = {
	smtpUrl: string;
	from: string;
};

export const mailerCreate = (options: TMailerOptions): TMailer => {
	const transport = createTransport(options.smtpUrl);

	const send = async (message: TMailMessage): Promise<void> => {
		await transport.sendMail({
			from: options.from,
			to: message.to,
			subject: message.subject,
			text: message.text,
			html: message.html,
		});
	};

	return { send };
};
