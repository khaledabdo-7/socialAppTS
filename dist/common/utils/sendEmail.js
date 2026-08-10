"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_service_1 = require("../../config/env.service");
const transporter = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: env_service_1.env.EMAIL_USER,
        pass: env_service_1.env.EMAIL_PASS,
    },
});
transporter.verify((error, success) => {
    if (error) {
        console.error("Nodemailer connection error:", error);
    }
    else {
        console.log("Server is ready to take our messages!");
    }
});
const sendEmail = async (to, subject, html) => {
    const info = await transporter.sendMail({
        from: env_service_1.env.EMAIL_USER,
        to,
        subject,
        html,
    });
    return info;
};
exports.default = sendEmail;
