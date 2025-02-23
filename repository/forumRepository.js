import { baseRepository } from './baseMongoDbRepository.js';
import { ObjectId } from 'mongodb';

const collectionName = 'forum';

export const forumRepository = {
  async getAllPosts() {
    const posts = await baseRepository.find(
      collectionName,
      {},
      { sort: { createdAt: -1 } }
    );

    posts.forEach((post) => {
      post.likes = post.likes || 0;
      post.comments = post.comments || [];
    });

    return posts;
  },

  async addPost(userId, userName, content) {
    return await baseRepository.insertOne(collectionName, {
      userId,
      userName,
      content,
      likes: 0,
      comments: [],
      createdAt: new Date(),
    });
  },

  async likePost(postId, userId) {
    const existingPost = await baseRepository.findOneById(
      collectionName,
      postId
    );

    if (!existingPost) {
      return null;
    }

    let updatedLikes = existingPost.likes || 0;
    let likedBy = existingPost.likedBy || [];

    let liked = false;

    if (likedBy.includes(userId)) {
      updatedLikes -= 1;
      likedBy = likedBy.filter((id) => id !== userId);
      liked = false;
    } else {
      updatedLikes += 1;
      likedBy.push(userId);
      liked = true;
    }

    const result = await baseRepository.updateOneById(collectionName, postId, {
      likes: updatedLikes,
      likedBy,
    });

    if (!result.modifiedCount) {
      return null;
    }

    return {
      success: true,
      message: liked ? 'Post liked!' : 'Post unliked!',
      likes: updatedLikes,
      liked,
    };
  },

  async addComment(postId, commentData) {
    try {
      const objectId = new ObjectId(postId);

      const existingPost = await baseRepository.findOneById(
        'forum_posts',
        objectId
      );
      if (!existingPost) {
        return { success: false, message: 'Post not found!' };
      }

      const updateResult = await baseRepository.updateOneById(
        'forum_posts',
        postId,
        { comments: [...(existingPost.comments || []), commentData] }
      );

      if (!updateResult.modifiedCount) {
        return { success: false, message: 'Failed to add comment!' };
      }

      return {
        success: true,
        message: 'Comment added successfully',
        data: commentData,
      };
    } catch (error) {
      return { success: false, message: 'Internal server error' };
    }
  },
};
