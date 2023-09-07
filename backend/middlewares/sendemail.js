const nodemailer = require("nodemailer");

exports.sendemail = async (options) => {
	const transporter = nodemailer.createTransport({
		host: "sandbox.smtp.mailtrap.io",
		port: 2525,
		auth: {
			user: "35665a544f4052",
			pass: "c13478686d49a4",
		},
	});

	const mailoptions = {
		from: process.env.SMPT_MAIL,
		to: options.email,
		subject: options.subject,
		text: options.message,
	};

	await transporter.sendMail(mailoptions);
};
