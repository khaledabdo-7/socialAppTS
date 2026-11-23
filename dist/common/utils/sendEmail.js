"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_service_1 = require("../../config/env.service");
const transporter = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: env_service_1.env.EMAIL_USER,
        pass: env_service_1.env.EMAIL_PASS,
    },
    connectionTimeout: 4000,
    greetingTimeout: 4000,
    socketTimeout: 4000,
});
transporter.verify((error) => {
    if (error) {
        console.warn("Nodemailer verify notice:", error?.message || error);
    }
    else {
        console.log("Server is ready to take our messages!");
    }
});
const sendEmail = async (to, subject, html) => {
    const info = await transporter.sendMail({
        from: `"Sphere" <${env_service_1.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    });
    return info;
};
exports.default = sendEmail;
