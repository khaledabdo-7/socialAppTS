"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutSchema = exports.refreshTokenSchema = exports.changePasswordSchema = exports.resetPasswordSchema = exports.forgetPasswordSchema = exports.resendOtpSchema = exports.verifyOtpSchema = exports.registerSchema = exports.loginSchema = void 0;
const z = __importStar(require("zod"));
exports.loginSchema = z.strictObject({
    body: z.strictObject({
        email: z
            .string()
            .email()
            .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email format" })
            .transform((val) => val.toLowerCase()),
        password: z
            .string()
            .min(8, { message: "Password must be at least 8 characters long" })
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        }),
    }),
});
exports.registerSchema = z.strictObject({
    body: z
        .strictObject({
        email: z
            .string()
            .email()
            .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
            message: "Invalid email format",
        })
            .transform((val) => val.toLowerCase()),
        password: z
            .string()
            .min(8, { message: "Password must be at least 8 characters long" })
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        }),
        confirmPassword: z
            .string()
            .min(8, { message: "Password must be at least 8 characters long" })
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        }),
        name: z
            .string()
            .min(2, { message: "Name must be at least 2 characters long" }),
        gender: z.enum(["male", "female"], {
            message: "Gender must be either 'male' or 'female'",
        }),
        role: z.enum(["admin", "user"], {
            message: "Role must be either 'admin' or 'user'",
        }),
        provider: z.enum(["google", "facebook", "system"], {
            message: "Provider must be either 'google', 'facebook', or 'system'",
        }),
    })
        .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }),
});
exports.verifyOtpSchema = z.strictObject({
    body: z.strictObject({
        email: z
            .string()
            .email()
            .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email format" })
            .transform((val) => val.toLowerCase()),
        otp: z
            .string()
            .min(6, { message: "OTP must be at least 6 characters long" }),
    }),
});
exports.resendOtpSchema = z.strictObject({
    body: z.strictObject({
        email: z
            .string()
            .email()
            .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email format" })
            .transform((val) => val.toLowerCase()),
    }),
});
exports.forgetPasswordSchema = z.strictObject({
    body: z.strictObject({
        email: z
            .string()
            .email()
            .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email format" })
            .transform((val) => val.toLowerCase()),
    }),
});
exports.resetPasswordSchema = z.strictObject({
    body: z.strictObject({
        email: z
            .string()
            .email()
            .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email format" })
            .transform((val) => val.toLowerCase()),
        otp: z
            .string()
            .min(6, { message: "OTP must be at least 6 characters long" }),
        newPassword: z
            .string()
            .min(8, { message: "Password must be at least 8 characters long" })
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        }),
    }),
});
exports.changePasswordSchema = z.strictObject({
    body: z.strictObject({
        email: z
            .string()
            .email()
            .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email format" })
            .transform((val) => val.toLowerCase()),
        oldPassword: z
            .string()
            .min(8, { message: "Password must be at least 8 characters long" })
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        }),
        newPassword: z
            .string()
            .min(8, { message: "Password must be at least 8 characters long" })
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        }),
    }),
});
exports.refreshTokenSchema = z.strictObject({
    body: z.strictObject({
        refreshToken: z
            .string({
            message: "Refresh token is required",
        })
            .min(1, { message: "Refresh token must be at least 1 character long" }),
    }),
});
exports.logoutSchema = z.strictObject({
    body: z.strictObject({
        refreshToken: z
            .string({
            message: "Refresh token is required",
        })
            .min(1, { message: "Refresh token must be at least 1 character long" }),
        accessToken: z
            .string({
            message: "Access token is required",
        })
            .min(1, { message: "Access token must be at least 1 character long" }),
    }),
});
