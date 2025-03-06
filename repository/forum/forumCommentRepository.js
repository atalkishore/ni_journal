import { baseRepository } from '../baseMongoDbRepository.js';
import { ObjectId } from 'mongodb';
import { toObjectID } from '../../utils/helpers.js';

const collectionName = 'forum_comments';

export const forumCommentsRepository = {
  async addComment(postId, userId, userName, comment) {
    try {
      const postObjectId = toObjectID(postId); // Convert postId to ObjectId

      const commentData = {
        _id: new ObjectId(),
        postId: postObjectId, // Store postId for reference
        userId: toObjectID(userId),
        userName,
        comment,
        likes: 0,
        likedBy: [],
        createdAt: new Date(),
      };

      const result = await baseRepository.insertOne(
        collectionName,
        commentData
      );

      if (!result.insertedId) {
        return { success: false, message: 'Failed to add comment!' };
      }

      return {
        success: true,
        message: 'Comment added successfully',
        data: commentData,
      };
    } catch (error) {
      console.error('🚨 Error adding comment:', error);
      return { success: false, message: 'Internal server error' };
    }
  },

  async getCommentsByPost(postId) {
    try {
      const postObjectId = toObjectID(postId); // Ensure postId is valid ObjectId

      const comments = await baseRepository.findMany(collectionName, {
        postId: postObjectId,
      });

      return comments;
    } catch (error) {
      console.error('🚨 Error fetching comments:', error);
      return null;
    }
  },
};
