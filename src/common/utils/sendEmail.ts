import nodemailer from "nodemailer";
import { env } from "../../config/env.service";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Nodemailer connection error:", error);
  } else {
    console.log("Server is ready to take our messages!");
  }
});

const sendEmail = async (to: string, subject: string, html: string) => {
  const info = await transporter.sendMail({
    from: env.EMAIL_USER,
    to,
    subject,
    html,
  });
  return info;
};

export default sendEmail;
