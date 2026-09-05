import { Post } from "../../../database/model/post";
import { IPost } from "../../../common/interface/post.interface";

export class PostService {
  public async createPost(postData: Partial<IPost>): Promise<IPost> {
    console.log("Post data in service:", postData); // Log the post data to verify its structure
    const newPost = new Post(postData);
    console.log("New post created:", newPost); // Log the new post to verify its structure
    await newPost.save();
    return newPost;
  }

  public async getPosts(userId: string): Promise<IPost[]> {
    const posts = await Post.find({ ownerId: userId });
    return posts;
  }

  public async getPostById(postId: string): Promise<Partial<IPost> | null> {
    const post = await Post.findById(postId);
    return post;
  }
}
