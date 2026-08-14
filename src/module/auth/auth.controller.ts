import Router, { Request, Response, NextFunction } from "express";
import AuthService from "./service/auth.service";
import { successResponse } from "../../common/response/success.response";
import * as authValidation from "./auth.validation";
import { validationMiddleware } from "../../middleware/validation.middleware";
const authRouter = Router();

authRouter.post(
  "/register",
  validationMiddleware(authValidation.registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, confirmPassword, name, gender, role, provider } =
        req.body;
      const user = await AuthService.register(
        email,
        password,
        confirmPassword,
        name,
        gender,
        role,
        provider,
      );
      res.status(200).json(user);
    } catch (error: Error | any) {
      next(error);
    }
  },
);

authRouter.post(
  "/login",
  validationMiddleware(authValidation.loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const authResponse = await AuthService.login(email, password);
      res.status(200).json(authResponse);
    } catch (error: Error | any) {
      next(error);
    }
  },
);

authRouter.post(
  "/verifyOtp",
  validationMiddleware(authValidation.verifyOtpSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, otp } = req.body;
      const isVerified = await AuthService.verifyOtp(email, otp);
      res.status(200).json(isVerified);
    } catch (error: Error | any) {
      next(error);
    }
  },
);

authRouter.post(
  "/resendOtp",
  validationMiddleware(authValidation.resendOtpSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      await AuthService.resendOtp(email);
      res.status(200).json({ message: "OTP sent successfully" });
    } catch (error: Error | any) {
      next(error);
    }
  },
);

authRouter.post(
  "/refreshToken",
  validationMiddleware(authValidation.refreshTokenSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const accessToken = await AuthService.refreshToken(refreshToken);
      res.status(200).json({ accessToken });
    } catch (error: Error | any) {
      next(error);
    }
  },
);

authRouter.post(
  "/logout",
  validationMiddleware(authValidation.logoutSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { accessToken, refreshToken } = req.body;
      await AuthService.logout(accessToken, refreshToken);
      successResponse(res, { message: "Logged out successfully" });
    } catch (error: Error | any) {
      next(error);
    }
  },
);

authRouter.post(
  "/forgetPassword",
  validationMiddleware(authValidation.forgetPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      await AuthService.forgetPassword(email);
      successResponse(res, { message: "Password reset successfully" });
    } catch (error: Error | any) {
      next(error);
    }
  },
);

authRouter.post(
  "/resetPassword",
  validationMiddleware(authValidation.resetPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, otp, newPassword } = req.body;
      await AuthService.resetPassword(email, otp, newPassword);
      successResponse(res, { message: "Password reset successfully" });
    } catch (error: Error | any) {
      next(error);
    }
  },
);

authRouter.post(
  "/changePassword",
  validationMiddleware(authValidation.changePasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, oldPassword, newPassword } = req.body;
      await AuthService.changePassword(email, oldPassword, newPassword);
      successResponse(res, { message: "Password changed successfully" });
    } catch (error: Error | any) {
      next(error);
    }
  },
);

export default authRouter;
