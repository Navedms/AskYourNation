import { log } from "console";
import nodemailer from "nodemailer";

interface MailSettings {
	host: string;
	port: any;
	secure: boolean;
	auth: {
		user: string;
		pass: string;
	};
}

const sendEmail = async (email: string, subject: string, text: string) => {
	try {
		const transporter = nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: process.env.EMAIL_PORT,
			secure: true,
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		} as MailSettings);

		const result = await new Promise((resolve, reject) => {
			transporter.sendMail(
				{
					from: process.env.EMAIL_USER,
					to: email,
					subject: subject,
					html: text,
				},
				function (error, response) {
					if (error) {
						console.log(error);
						reject(error);
					} else {
						resolve("email sent sucessfully");
					}
				}
			);
		});
		console.log(result);
	} catch (error) {
		console.log("email not sent");
		console.log(error);
	}
};

export default sendEmail;
