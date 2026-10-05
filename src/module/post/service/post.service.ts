import { Post } from "../../../database/model/post";
import { IPost } from "../../../common/interface/post.interface";
import { DatabaseRepository } from "../../../database/repositories/database.repositorie";

class PostService {
  private postRepository: DatabaseRepository<IPost>;

  constructor() {
    this.postRepository = new DatabaseRepository(Post);
  }

  public async createPost(postData : IPost): Promise<IPost> {
    console.log("Post data in service:", postData); // Log the post data to verify its structure
    const newPost = await this.postRepository.create(postData);
    console.log("New post created:", newPost); // Log the new post to verify its structure
    await newPost.save();
    return newPost;
  }

  public async getAllPosts(userId: string): Promise<IPost[]> {
    const posts = await this.postRepository.findAll ({filter :{ ownerId: userId }});
    return posts ;
  }

  public async getPostById(postId: string): Promise<Partial<IPost> | null> {
    const post = await this.postRepository.findOne({ filter: { id: postId } });
    return post;
  }
}

export default new PostService();
