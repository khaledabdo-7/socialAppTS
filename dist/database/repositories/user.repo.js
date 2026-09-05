"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepo = void 0;
const user_model_1 = require("../model/user.model");
class UserRepo {
    userModel = user_model_1.User;
    constructor() {
        this.userModel = user_model_1.User;
    }
    async createUser(user) {
        return await this.userModel.create(user);
    }
}
exports.UserRepo = UserRepo;
