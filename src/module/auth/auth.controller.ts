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



  export default authRouter;