import nodemailer from "nodemailer";
import { env } from "../../config/env.service";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
  connectionTimeout: 4000,
  greetingTimeout: 4000,
  socketTimeout: 4000,
});

transporter.verify((error) => {
  if (error) {
    console.warn("Nodemailer verify notice:", error?.message || error);
  } else {
    console.log("Server is ready to take our messages!");
  }
});

const sendEmail = async (to: string, subject: string, html: string) => {
  const info = await transporter.sendMail({
    from: `"Sphere" <${env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
  return info;
};

export default sendEmail;