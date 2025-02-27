import { baseRepository } from '../baseMongoDbRepository.js';
import { ObjectId } from 'mongodb';

const collectionName = 'forum_post';
// get all post withour filter
// get all post by user id
// get post by post id
// get post by post id , user id
// add post
// add post like
// get post likes by post id

export const forumPostRepository = {
  async getAllPosts() {
    const posts = await baseRepository.find(
      collectionName,
      {},
      { sort: { createdAt: -1 } }
    );

    posts.forEach((post) => {
      post.likes = post.likes || 0;
      post.comments = post.comments || [];

      post.comments.forEach((comment) => {
        comment.likes = comment.likes || 0;
        comment.likedBy = comment.likedBy || [];
      });
    });

    return posts;
  },

  async addPost(userId, userName, content) {
    return await baseRepository.insertOne(collectionName, {
      userId,
      userName,
      content,
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: new Date(),
    });
  },

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
      //get post
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
};
