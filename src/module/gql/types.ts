import { GraphQLObjectType, GraphQLString, GraphQLID } from "graphql";
import { ReactGraphQLType } from "../../common/enum/reacts.enum";

export const ReactionGQLType = new GraphQLObjectType({
  name: "Reaction",
  fields: () => ({
    user: { type: GraphQLID },
    type: { type: ReactGraphQLType },
  }),
});

export const ReplyGQLType = new GraphQLObjectType({
  name: "Reply",
  fields: () => ({
    id: { type: GraphQLString },
    commentId: { type: GraphQLID },
    user: { type: GraphQLID },
    content: { type: GraphQLString },
  }),
});

export const PostAuthorType = new GraphQLObjectType({
  name: "PostAuthor",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
  }),
});

export const PostCommentType = new GraphQLObjectType({
  name: "PostComment",
  fields: () => ({
    id: { type: GraphQLID },
    content: { type: GraphQLString },
    userId: { type: PostAuthorType },
  }),
});
