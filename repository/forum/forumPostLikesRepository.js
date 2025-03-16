import { baseRepository } from '../baseMongoDbRepository.js';
import { toObjectID } from '../../utils/helpers.js';

const collectionName = 'forum_post_likes';

export const forumPostLikesRepository = {
  async getLikeCount(postId) {
    const count = await baseRepository.countDocuments(collectionName, {
      postId: toObjectID(postId),
    });

    return count;
  },

  async isPostLiked(postId, userId) {
    return await baseRepository.findOne(collectionName, {
      postId: toObjectID(postId),
      userId: toObjectID(userId),
    });
  },

  async addLike(postId, userId) {
    const likeDoc = await baseRepository.insertOne(collectionName, {
      postId: toObjectID(postId),
      userId: toObjectID(userId),
      createdAt: new Date(),
      likes: 0,
    });

    const likeCount = await this.getLikeCount(postId);
    await baseRepository.updateOne(
      collectionName,
      { postId: toObjectID(postId) },
      { likes: likeCount }
    );

    return likeDoc;
  },

  async removeLike(postId, userId) {
    await baseRepository.deleteOneByFilter(collectionName, {
      postId: toObjectID(postId),
      userId: toObjectID(userId),
    });

    const likeCount = await this.getLikeCount(postId);
    await baseRepository.updateOne(
      collectionName,
      { postId: toObjectID(postId) },
      { likes: likeCount }
    );
  },
};
