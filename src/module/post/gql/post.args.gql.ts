import {
  GraphQLString,
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
} from "graphql";

export const PostGQLArgs = {
  title: {
    type: GraphQLString,
  },
  content: {
    type: GraphQLString,
  },
  ownerId: {
    type: GraphQLString,
  },
  tags: {
    type: GraphQLString,
  },
  imageUrl: {
    type: GraphQLString,
  },

  reaction: {
    type: GraphQLString,
  },
};

export const PostListGQLArgs = {};

export const addPostGQLArgs = {
  userId: {
    type: GraphQLString,
  },
  tags: {
    type: new GraphQLList(GraphQLString),
  },
  title: {
    type: GraphQLString,
  },
  content: {
    type: GraphQLString,
  },
  allowComments: {
    type: GraphQLBoolean,
    defaultValue: true,
  },
  imageUrl: {
    type: new GraphQLList(GraphQLString),
  },
};
