import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean,
} from "graphql";
import {
  graphqlUserRole,
  graphqlUserGender,
  graphqlProviderType,
} from "../../../common/enum/user.enum";

export const UserGQLType = new GraphQLObjectType({
  name: "userQuery",
  fields: {
    message: {
      type: GraphQLString,
    },
  },
});

export const oneUserGQLType = new GraphQLObjectType({
  name: "oneUserQuery",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    role: { type: graphqlUserRole },
    gender: { type: graphqlUserGender },
    provider: { type: graphqlProviderType },
    isDeactivated: { type: GraphQLBoolean },
    isVerified: { type: GraphQLBoolean },
    isPrivate: { type: GraphQLBoolean },
  }),
});

