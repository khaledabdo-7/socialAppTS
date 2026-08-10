"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_service_1 = __importDefault(require("./service/auth.service"));
const authRouter = (0, express_1.default)();
authRouter.post("/register", async (req, res, next) => {
    try {
        const { email, password, confirmPassword, name, gender, role, provider, } = req.body;
        const user = await auth_service_1.default.register(email, password, confirmPassword, name, gender, role, provider);
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
});
authRouter.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const authResponse = await auth_service_1.default.login(email, password);
        res.status(200).json(authResponse);
    }
    catch (error) {
        next(error);
    }
});
exports.default = authRouter;
