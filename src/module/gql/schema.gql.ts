import { graphql, GraphQLSchema, GraphQLObjectType } from "graphql";
import { userGQLSchema } from "../user/gql/user.schema.gql";
import { postGQLSchema } from "../post/gql/post.schema.gql";

const query = new GraphQLObjectType({
  name: "Query",
  fields: {
    ...userGQLSchema.registerQuery(),
    ...postGQLSchema.registerQuery(),
  },
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    ...postGQLSchema.registerMutation(),
  },
});

export const schema = new GraphQLSchema({ query, mutation });
