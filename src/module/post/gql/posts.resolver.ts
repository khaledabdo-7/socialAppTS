import PostService from "../service/post.service";
import { graphQLAuthMiddleware } from "../../../middleware/graphQLAuth.middleware";
import { GQLValidation } from "../../../middleware/validation.middleware";
import { createPostSchema } from "../post.validation.gql";
import { mapGraphQLError } from "../../../common/response/error.response";

class PostGQLResolver {
  private postService: typeof PostService;
  constructor() {
    this.postService = PostService;
  }

  helloResolver = async (parent: any, args: any) => {
    return {
      message: "hello",
    };
  };

  postList = async (parent: any, args: any, context: any) => {
    try {
      console.log(context);
      await graphQLAuthMiddleware(context);
      let postData = await this.postService.getAllPosts(args.ownerId);

      const customPostData = postData.map((post: any) => {
        id: post.id;
        title: post.title;
        content: post.content;
      });

      return {
        posts: customPostData,
      };
    } catch (error: any) {
      if (error.statusCode) {
        mapGraphQLError(error);
      }
      throw new Error("An unexpected error occurred");
    }
  };

  createPost = async (parent: any, args: any, context: any) => {
    try {
      console.log(context);
      await graphQLAuthMiddleware(context);
      const validatedArgs = GQLValidation(createPostSchema, args);
      let newPostPayload = {
        ...validatedArgs,
        comments: [] as string[],
        reaction: [] as string[],
      };

      let postData = await this.postService.createPost(newPostPayload as any);
      return {
        post: postData,
      };
    } catch (error: any) {
      if (error.statusCode) {
        mapGraphQLError(error);
      }
      throw new Error("An unexpected error occurred");
    }
  };
}

export const postGQLResolver = new PostGQLResolver();
