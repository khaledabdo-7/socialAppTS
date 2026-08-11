import Router, { Request, Response, NextFunction } from "express";
import AuthService from "./service/auth.service";

const authRouter = Router();

authRouter.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        email,
        password,
        confirmPassword,
        name,
        gender,
        role,
        provider,
      } = req.body;
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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const authResponse = await AuthService.login(email, password);
      res.status(200).json(authResponse);
    } catch (error: Error | any) {
      next(error);
    }
  },)

authRouter.post(
  "/verifyOtp",
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

  export default authRouter;