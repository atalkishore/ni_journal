import { baseRepository } from '../baseMongoDbRepository.js';
import { ObjectId } from 'mongodb';
import { toObjectID } from '../../utils/helpers.js';

const collectionName = 'forum_comments';

export const forumCommentsRepository = {
  async addComment(postId, userId, userName, comment) {
    try {
      const postObjectId = toObjectID(postId);
      const commentData = {
        _id: new ObjectId(),
        postId: postObjectId,
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
      return { success: false, message: 'Internal server error' };
    }
  },

  async getCommentsByPost(postId) {
    try {
      const postObjectId = toObjectID(postId);

      const comments = await baseRepository.find(collectionName, {
        postId: postObjectId,
      });

      return comments;
    } catch (error) {
      return null;
    }
  },
};
