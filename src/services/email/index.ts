import nodemailer from "nodemailer";

interface ISendEmail {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

class EmailService {
    private transporter;
    private user: string;
    private pass: string;

    constructor() {

        if (!process.env.GMAIL_APP_USER || !process.env.GMAIL_APP_PASSWORD) {
            throw "Credentials not set for email service";
        }
        this.user = process.env.GMAIL_APP_USER;
        this.pass = process.env.GMAIL_APP_PASSWORD;

        this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: this.user,
                pass: this.pass
            }
        });
    }
    async sendEmail({
        to,
        subject,
        text,
        html
    }: ISendEmail) {
        try {
            await this.transporter.sendMail({
                from: process.env.GMAIL_USER,
                to,
                subject,
                text,
                html
            });
        } catch (error) {
            console.error("Error sending email:", error);
            throw "Failed to send email";
        }
    }
}

export default EmailService;