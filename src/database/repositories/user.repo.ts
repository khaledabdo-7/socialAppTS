import { User } from "../model/user.model";
import { IUser } from "../../common/interface/user.interface";

export class UserRepo {
    private userModel = User;
    constructor() {
        this.userModel = User;
    }

    async createUser(user: Partial<IUser>) {
        return await this.userModel.create(user)
}
}