import { PostGQLType, addPostGQLType, onePostType } from "./post.types.gql";
import { addPostGQLArgs, PostGQLArgs } from "./post.args.gql";
import { postGQLResolver } from "./posts.resolver";
import { PostListGQLType } from "./post.types.gql";

class PostGQLSchema {
  constructor() {}

  registerQuery() {
    return {
      helloPost: {
        name: "helloPostQuery",
        type: PostGQLType,
        args: PostGQLArgs,
        resolve: postGQLResolver.helloResolver,
      },
      postList: {
        name: "postList",
        type: PostListGQLType,
        args: PostGQLArgs,
        resolve: postGQLResolver.postList,
      },
    };
  }

  registerMutation() {
    return {
      createPost: {
        name: "createPost",
        type: addPostGQLType,
        args: addPostGQLArgs,
        resolve: postGQLResolver.createPost,
      },
    };
  }
}

export const postGQLSchema = new PostGQLSchema();
