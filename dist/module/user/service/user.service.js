"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = require("../../../database/model/user.model");
const error_response_1 = require("../../../common/response/error.response");
const database_repositorie_1 = require("../../../database/repositories/database.repositorie");
class UserService {
    userRepository;
    constructor() {
        this.userRepository = new database_repositorie_1.DatabaseRepository(user_model_1.User);
    }
    async getUserById(id) {
        const user = await this.userRepository.findOne({ filter: { id } });
        if (!user) {
            throw new error_response_1.NotFoundError("User not found");
        }
        return {
            id: user.id,
            name: user.name,
            role: user.role,
            gender: user.gender,
        };
    }
    async getUserByEmail(email) {
        const user = await this.userRepository.findOne({ filter: { email } });
        if (!user) {
            throw new error_response_1.NotFoundError("User not found");
        }
        return {
            id: user.id,
            name: user.name,
            role: user.role,
            gender: user.gender,
        };
    }
}
exports.UserService = UserService;
