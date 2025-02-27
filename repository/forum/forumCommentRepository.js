import { baseRepository } from '../baseMongoDbRepository.js';
import { ObjectId } from 'mongodb';

const collectionName = 'forum_comments';

export const forumCommentsRepository = {
  async addComment(postId, userId, userName, comment) {
    try {
      if (!ObjectId.isValid(postId)) {
        return { success: false, message: 'Invalid Post ID format!' };
      }

      const objectId = new ObjectId(postId);

      const existingPost = await baseRepository.findOne(collectionName, {
        _id: objectId,
      });

      if (!existingPost) {
        return { success: false, message: 'Post not found!' };
      }

      const commentData = {
        _id: new ObjectId(),
        userId,
        userName,
        comment,
        likes: 0,
        likedBy: [],
        createdAt: new Date(),
      };

      const updateQuery = {
        $push: { comments: commentData },
        $set: { updatedAt: new Date() },
      };

      const updateResult = await baseRepository.updateOneWithOperators(
        collectionName,
        { _id: objectId },
        updateQuery
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
