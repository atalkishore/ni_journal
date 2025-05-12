import { baseRepository } from '../baseMongoDbRepository.js';
import { toObjectID } from '../../utils/helpers.js';

const collectionName = 'forum_comment_likes';

export const forumCommentLikesRepository = {
  async getLikeCount(commentId) {
    const count = await baseRepository.countDocuments(collectionName, {
      commentId: toObjectID(commentId),
    });
    return count;
  },

  async isCommentLiked(commentId, userId) {
    return await baseRepository.findOne(collectionName, {
      commentId: toObjectID(commentId),
      userId: toObjectID(userId),
    });
  },

  async addLike(commentId, userId) {
    return await baseRepository.insertOne(collectionName, {
      commentId: toObjectID(commentId),
      userId: toObjectID(userId),
      createdAt: new Date(),
    });
  },

  async removeLike(commentId, userId) {
    return await baseRepository.deleteOneByFilter(collectionName, {
      commentId: toObjectID(commentId),
      userId: toObjectID(userId),
    });
  },

  async toggleLike(commentId, userId) {
    const commentObjectId = toObjectID(commentId);
    const userObjectId = toObjectID(userId);

    const existingLike = await baseRepository.findOne(collectionName, {
      commentId: commentObjectId,
      userId: userObjectId,
    });

    if (existingLike) {
      await baseRepository.deleteOneByFilter(collectionName, {
        commentId: commentObjectId,
        userId: userObjectId,
      });
    } else {
      await baseRepository.insertOne(collectionName, {
        commentId: commentObjectId,
        userId: userObjectId,
        createdAt: new Date(),
      });
    }

    const likeCount = await baseRepository.countDocuments(collectionName, {
      commentId: commentObjectId,
    });

    return { likeCount };
  },
};
