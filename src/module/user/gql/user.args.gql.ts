import { GraphQLString } from "graphql";

export const UserGQLArgs = {
  name: {
    type: GraphQLString,
  },
  email: {
    type: GraphQLString,
  },
  password: {
    type: GraphQLString,
  },
};

