import { User } from "../../../database/model/user.model";
import { IUser } from "../../../common/interface/user.interface";
import { IUserResponse } from "../../../common/interface/userResponseInterface";
import { NotFoundError } from "../../../common/response/error.response";

export class UserService {
  async getUserById(id: string): Promise<any> {
    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return {
      id: user.id,
      name: user.name,
      role: user.role,
      gender: user.gender,
    };
  }


  async getUserByEmail(email: string): Promise<any> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return {
      id: user.id,
      name: user.name,
      role: user.role,
      gender: user.gender,
    };
  }


}