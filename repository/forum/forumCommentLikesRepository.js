import { baseRepository } from '../baseMongoDbRepository.js';
import { ObjectId } from 'mongodb';

const collectionName = 'forum_comments_likes';

export const forumCommentLikesRepository = {
  async likeComment(postId, commentId, userId) {
    try {
      if (!ObjectId.isValid(postId)) {
        return { success: false, message: 'Invalid Post ID format!' };
      }

      if (!ObjectId.isValid(commentId)) {
        return { success: false, message: 'Invalid Comment ID format!' };
      }

      const objectId = new ObjectId(postId);
      const commentObjectId = new ObjectId(commentId);

      const post = await baseRepository.findOne(collectionName, {
        _id: objectId,
      });

      if (!post) {
        return { success: false, message: 'Post not found!' };
      }

      const comments = post.comments || [];
      const commentIndex = comments.findIndex(
        (c) => c._id.toString() === commentId
      );

      if (commentIndex === -1) {
        return { success: false, message: 'Comment not found!' };
      }

      let comment = comments[commentIndex];
      let updatedLikes = comment.likes || 0;
      let likedBy = comment.likedBy.map((id) => id.toString());

      let liked = false;

      if (likedBy.includes(userId.toString())) {
        updatedLikes -= 1;
        likedBy = likedBy.filter((id) => id !== userId.toString());
        liked = false;
      } else {
        updatedLikes += 1;
        likedBy.push(userId.toString());
        liked = true;
      }

      const updateQuery = {
        $set: {
          [`comments.${commentIndex}.likes`]: updatedLikes,
          [`comments.${commentIndex}.likedBy`]: likedBy,
        },
      };

      const updateResult = await baseRepository.updateOneWithOperators(
        collectionName,
        { _id: objectId },
        updateQuery
      );

      if (!updateResult.modifiedCount) {
        return { success: false, message: 'Failed to like/unlike comment!' };
      }

      return {
        success: true,
        message: liked ? 'Comment liked!' : 'Comment unliked!',
        likes: updatedLikes,
        liked,
      };
    } catch (error) {
      return { success: false, message: 'Internal server error' };
    }
  },
};
