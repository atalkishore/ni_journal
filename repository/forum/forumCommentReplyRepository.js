import { baseRepository } from '../baseMongoDbRepository.js';
import { ObjectId } from 'mongodb';

const collectionName = 'forum_comments_reply';

export const forumCommentsReplyRepository = {
  async addReplyToComment(postId, commentId, userId, replyText) {
    const replyData = {
      _id: new ObjectId(),
      userId: new ObjectId(userId),
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
  },
};
