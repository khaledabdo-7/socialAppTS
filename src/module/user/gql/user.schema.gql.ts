import { UserGQLArgs } from "./user.args.gql";
import { UserGQLType } from "./user.types.gql";
import { userGQLResolver } from "./user.resolver";

class UserGQLSchema {
  constructor() {}
  registerQuery() {
    return {
      helloUser: {
        name: "userQuery",
        type: UserGQLType,
        args: UserGQLArgs,
        resolve: userGQLResolver.helloResolver,
      },
    };
  }
}

export const userGQLSchema = new UserGQLSchema();

