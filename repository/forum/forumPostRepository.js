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

  async likePost(postId, userId) {
    const existingPost = await baseRepository.findOneById(
      collectionName,
      postId
    );
    if (!existingPost) {
      return { success: false, message: 'Post not found' };
    }

    let updatedLikes = existingPost.likes || 0;
    let likedBy = existingPost.likedBy || [];

    const userIndex = likedBy.indexOf(userId);
    const isLiked = userIndex === -1;

    if (isLiked) {
      likedBy.push(userId);
      updatedLikes += 1;
    } else {
      likedBy.splice(userIndex, 1);
      updatedLikes -= 1;
    }

    const result = await baseRepository.updateOneById(collectionName, postId, {
      likes: updatedLikes,
      likedBy,
    });

    if (result.modifiedCount) {
      return {
        success: true,
        message: isLiked ? 'Post liked!' : 'Post unliked!',
        likes: updatedLikes,
        liked: isLiked,
      };
    } else {
      return { success: false, message: 'Failed to update like status' };
    }
  },

  async getPostById(postId) {
    return await baseRepository.findOneById(collectionName, postId);
  },
};
