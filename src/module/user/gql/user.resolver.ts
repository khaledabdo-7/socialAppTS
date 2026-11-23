class UserGQLResolver {
  constructor() {}
  helloResolver(parent: any, args: any) {
    return {
      message: `Hello ${args?.name || "User"}`,
    };
  }
}

export const userGQLResolver = new UserGQLResolver();

