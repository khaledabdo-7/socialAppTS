import { User } from "../../../database/model/user.model";
import { IUser } from "../../../common/interface/user.interface";
import { IUserResponse } from "../../../common/interface/userResponseInterface";
import { NotFoundError } from "../../../common/response/error.response";
import { DatabaseRepository } from "../../../database/repositories/database.repositorie";

export class UserService {

  private userRepository: DatabaseRepository<IUser>;
  constructor() {
    this.userRepository = new DatabaseRepository(User);
  }
  async getUserById(id: string): Promise<any> {
    const user = await this.userRepository.findOne({ filter: { id } });
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
    const user = await this.userRepository.findOne({ filter: { email } });
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