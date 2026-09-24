import nodemailer from "nodemailer";

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT
    ? parseInt(process.env.SMTP_PORT, 10)
    : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass || !host) {
    throw new Error(
      "SMTP_HOST, SMTP_USER or SMTP_PASS is missing in environment variables",
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports like 587
    auth: {
      user,
      pass,
    },
  });
};

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Email sent successfully to ${options.to}. Message ID: ${info.messageId}`,
    );
  } catch (error: any) {
    console.error(`Error sending email to ${options.to}:`, error);
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};

export const verifySMTP = async (): Promise<void> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log(`SMTP Connected: ${process.env.SMTP_USER}`);
  } catch (error: any) {
    console.error(`Error connecting to SMTP: ${error.message}`);
  }
};
