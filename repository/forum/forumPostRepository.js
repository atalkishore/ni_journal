import { baseRepository } from '../baseMongoDbRepository.js';
import { forumPostLikesRepository } from './forumPostLikesRepository.js';

const collectionName = 'forum_post';
// get all post withour filter
// get all post by user id
// get post by post id
// get post by post id , user id
// add post
// add post like
// get post likes by post id

export const forumPostRepository = {
  async getAllPosts() {
    const posts = await baseRepository.find(
      collectionName,
      {},
      { sort: { createdAt: -1 } }
    );

    for (const post of posts) {
      post.likes = await forumPostLikesRepository.getLikeCount(post._id);
      post.comments = post.comments || [];

      post.comments.forEach((comment) => {
        comment.likes = comment.likes || 0;
        comment.likedBy = comment.likedBy || [];
      });
    }

    return posts;
  },

  async addPost(userId, userName, content) {
    return await baseRepository.insertOne(collectionName, {
      userId,
      userName,
      content,
      status: 'Active',
      createdAt: new Date(),
    });
  },

  async getPostById(postId) {
    return await baseRepository.findOneById(collectionName, postId);
  },
};
