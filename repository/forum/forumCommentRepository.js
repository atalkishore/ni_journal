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

  async likeComment(commentId, userId) {
    const comment = await baseRepository.findOne('forum_comments', {
      _id: toObjectID(commentId),
    });

    if (!comment) {
      return { success: false, message: 'Comment not found!' };
    }

    const alreadyLiked = comment.likedBy.includes(userId);
    let updatedLikes = alreadyLiked ? comment.likes - 1 : comment.likes + 1;

    try {
      const updateQuery = alreadyLiked
        ? {
            likes: updatedLikes,
            likedBy: comment.likedBy.filter((id) => id !== userId),
          }
        : { likes: updatedLikes, likedBy: [...comment.likedBy, userId] };

      const result = await baseRepository.updateOne(
        'forum_comments',
        { _id: toObjectID(commentId) },
        updateQuery
      );

      return { success: true, message: 'Comment liked/unliked successfully!' };
    } catch (error) {
      return {
        success: true,
        message: 'Comment liked/unliked successfully!',
        likes: updatedLikes,
      };
    }
  },
};
