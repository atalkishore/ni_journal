import { baseRepository } from '../baseMongoDbRepository.js';
import { ObjectId } from 'mongodb';

const collectionName = 'forum_comments_reply';

export const forumCommentsReplyRepository = {
  async addReplyToComment(postId, commentId, userId, replyText, userName) {
    try {
      let user = await baseRepository.findOne('users', {
        _id: new ObjectId(userId),
      });

      const replyData = {
        userId: new ObjectId(userId),
        userName: userName || (user && user.name ? user.name : 'Unknown'),
        commentId: new ObjectId(commentId),
        postId: new ObjectId(postId),
        reply: replyText,
        createdAt: new Date(),
      };

      const insertedReply = await baseRepository.insertOne(
        collectionName,
        replyData
      );
      return insertedReply ? replyData : null;
    } catch (error) {
      return null;
    }
  },

  async getRepliesByCommentId(commentId) {
    try {
      const replies = await baseRepository.find(collectionName, {
        commentId: new ObjectId(commentId),
      });

      return replies;
    } catch (error) {
      throw error;
    }
  },
};
