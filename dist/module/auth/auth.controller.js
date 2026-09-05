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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_service_1 = __importDefault(require("./service/auth.service"));
const success_response_1 = require("../../common/response/success.response");
const authValidation = __importStar(require("./auth.validation"));
const validation_middleware_1 = require("../../middleware/validation.middleware");
const authRouter = (0, express_1.default)();
authRouter.post("/register", 
// validationMiddleware(authValidation.registerSchema),
async (req, res, next) => {
    try {
        const { email, password, confirmPassword, name, gender, role, provider } = req.body;
        const user = await auth_service_1.default.register(email, password, confirmPassword, name, gender, role, provider);
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
});
authRouter.post("/login", 
// validationMiddleware(authValidation.loginSchema),
async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const authResponse = await auth_service_1.default.login(email, password);
        res.status(200).json(authResponse);
    }
    catch (error) {
        next(error);
    }
});
authRouter.post("/verifyOtp", (0, validation_middleware_1.validationMiddleware)(authValidation.verifyOtpSchema), async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const isVerified = await auth_service_1.default.verifyOtp(email, otp);
        res.status(200).json(isVerified);
    }
    catch (error) {
        next(error);
    }
});
authRouter.post("/resendOtp", (0, validation_middleware_1.validationMiddleware)(authValidation.resendOtpSchema), async (req, res, next) => {
    try {
        const { email } = req.body;
        await auth_service_1.default.resendOtp(email);
        res.status(200).json({ message: "OTP sent successfully" });
    }
    catch (error) {
        next(error);
    }
});
authRouter.post("/refreshToken", (0, validation_middleware_1.validationMiddleware)(authValidation.refreshTokenSchema), async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const accessToken = await auth_service_1.default.refreshToken(refreshToken);
        res.status(200).json({ accessToken });
    }
    catch (error) {
        next(error);
    }
});
authRouter.post("/logout", (0, validation_middleware_1.validationMiddleware)(authValidation.logoutSchema), async (req, res, next) => {
    try {
        const { accessToken, refreshToken } = req.body;
        await auth_service_1.default.logout(accessToken, refreshToken);
        (0, success_response_1.successResponse)(res, { message: "Logged out successfully" });
    }
    catch (error) {
        next(error);
    }
});
authRouter.post("/forgetPassword", (0, validation_middleware_1.validationMiddleware)(authValidation.forgetPasswordSchema), async (req, res, next) => {
    try {
        const { email } = req.body;
        await auth_service_1.default.forgetPassword(email);
        (0, success_response_1.successResponse)(res, { message: "Password reset successfully" });
    }
    catch (error) {
        next(error);
    }
});
authRouter.post("/resetPassword", (0, validation_middleware_1.validationMiddleware)(authValidation.resetPasswordSchema), async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        await auth_service_1.default.resetPassword(email, otp, newPassword);
        (0, success_response_1.successResponse)(res, { message: "Password reset successfully" });
    }
    catch (error) {
        next(error);
    }
});
authRouter.post("/changePassword", (0, validation_middleware_1.validationMiddleware)(authValidation.changePasswordSchema), async (req, res, next) => {
    try {
        const { email, oldPassword, newPassword } = req.body;
        await auth_service_1.default.changePassword(email, oldPassword, newPassword);
        (0, success_response_1.successResponse)(res, { message: "Password changed successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.default = authRouter;
