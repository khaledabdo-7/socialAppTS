import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLBoolean,
} from "graphql";
import { ReactType } from "../../../common/enum/reacts.enum";
import { ReactGraphQLType } from "../../../common/enum/reacts.enum";
import { ReactionGQLType } from "../../gql/types";

export const PostGQLType = new GraphQLObjectType({
  name: "helloPostQuery",
  fields: {
    message: {
      type: GraphQLString,
    },
  },
});

export const onePostType = new GraphQLObjectType({
  name: "onePost",
  fields: () => ({
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    comments: {
      type: new GraphQLList(GraphQLID),
    },
    owner: { type: GraphQLID },
    tags: { type: new GraphQLList(GraphQLID) },
    allowComments: { type: GraphQLBoolean },
    imageUrl: { type: new GraphQLList(GraphQLString) },
    reaction: {
      type: new GraphQLList(ReactionGQLType),
    },
  }),
});

export const PostListGQLType = new GraphQLObjectType({
  name: "PostList",
  fields: () => ({
    posts: {
      type: new GraphQLList(onePostType),
      resolve: (parent: any, args: any) => {
        return parent.posts;
      },
    },
  }),
});

export const addPostGQLType = new GraphQLObjectType({
  name: "addPost",
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    comments: {
      type: new GraphQLList(GraphQLID),
    },
    owner: { type: GraphQLID },
    tags: { type: new GraphQLList(GraphQLID) },
    allowComments: { type: GraphQLBoolean },
    imageUrl: { type: new GraphQLList(GraphQLString) },
    reaction: {
      type: new GraphQLList(ReactionGQLType),
    },
  }),
});
