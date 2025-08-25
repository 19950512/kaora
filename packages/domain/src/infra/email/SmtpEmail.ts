import { Email } from '../../core/interfaces/email/Email';
import nodemailer from 'nodemailer';

export class SmtpEmail implements Email {
  private transporter;
  private user: string;

  constructor(config: { host: string; port: number; user: string; pass: string }) {
    this.user = config.user;
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  async send(to: string, subject: string, body: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.user,
      to,
      subject,
      text: body,
    });
  }
}
