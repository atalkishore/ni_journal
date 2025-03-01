import { Router } from 'express';
import asyncMiddleware from '../config/asyncMiddleware.config.js';
import { AuthenticationMiddleware } from '../config/ensureUserRole.config.js';
import { forumPostRepository } from '../repository/forum/forumPostRepository.js';
import { forumCommentsRepository } from '../repository/forum/forumCommentRepository.js';
import { forumCommentLikesRepository } from '../repository/forum/forumCommentLikesRepository.js';
import { forumCommentsReplyRepository } from '../repository/forum/forumCommentReplyRepository.js';

const apiForumRouter = Router();

apiForumRouter.get(
  '/posts',
  AuthenticationMiddleware.ensureLoggedInApi(),
  asyncMiddleware(async (req, res) => {
    const posts = await forumPostRepository.getAllPosts();
    res.sendJsonResponse(200, 'Posts fetched successfully', posts);
  })
);

apiForumRouter.post(
  '/posts',
  AuthenticationMiddleware.ensureLoggedInApi(),
  asyncMiddleware(async (req, res) => {
    const { content } = req.body;
    const userId = req.user?._id;
    const userName = req.user?.name || 'Anonymous';

    if (!content) return res.sendJsonResponse(400, 'Post content is required');

    const newPost = await forumPostRepository.addPost(
      userId,
      userName,
      content
    );
    res.sendJsonResponse(200, 'Post added successfully', newPost);
  })
);

apiForumRouter.post(
  '/posts/:postId/like',
  AuthenticationMiddleware.ensureLoggedInApi(),
  asyncMiddleware(async (req, res) => {
    const { postId } = req.params;

    const updatedPost = await forumPostRepository.likePost(postId);

    if (!updatedPost) {
      return res.sendJsonResponse(500, 'Failed to like post');
    }

    res.sendJsonResponse(200, 'Post liked successfully', updatedPost);
  })
);

apiForumRouter.post(
  '/comment',
  AuthenticationMiddleware.ensureLoggedInApi(),
  asyncMiddleware(async (req, res) => {
    const { postId, comment } = req.body;
    const userId = req.user?._id;
    const userName = req.user?.name || 'Anonymous';

    if (!postId || !comment) return res.sendJsonResponse(400, 'Invalid data');

    const updatedPost = await forumCommentsRepository.addComment(
      postId,
      userId,
      userName,
      comment
    );
    res.sendJsonResponse(200, 'Comment added successfully', updatedPost);
  })
);

apiForumRouter.get(
  '/comment/:postId',
  AuthenticationMiddleware.ensureLoggedInApi(),
  asyncMiddleware(async (req, res) => {
    const { postId } = req.params;

    if (!postId) {
      return res.sendJsonResponse(400, 'Post ID is required');
    }

    const comments = await forumCommentsRepository.getCommentsByPost(postId);

    if (!comments || comments.length === 0) {
      return res.sendJsonResponse(404, 'No comments found for this post');
    }

    res.sendJsonResponse(200, 'Comments retrieved successfully', comments);
  })
);

apiForumRouter.post(
  '/posts/:postId/comments/:commentId/commentlike',
  AuthenticationMiddleware.ensureLoggedInApi(),
  asyncMiddleware(async (req, res) => {
    const { postId, commentId } = req.params;
    const userId = req.user?._id;

    if (!postId || !commentId) {
      return res.sendJsonResponse(400, 'Invalid Post ID or Comment ID');
    }

    const updatedComment = await forumCommentLikesRepository.likeComment(
      postId,
      commentId,
      userId
    );

    if (!updatedComment) {
      return res.sendJsonResponse(500, 'Failed to like comment');
    }

    res.sendJsonResponse(200, 'Comment liked successfully', updatedComment);
  }),

  apiForumRouter.post(
    '/posts/:postId/comments/:commentId/reply',
    AuthenticationMiddleware.ensureLoggedInApi(),
    asyncMiddleware(async (req, res) => {
      const { postId, commentId } = req.params;
      const { reply } = req.body;
      const userId = req.user.id;

      if (!reply) {
        return res.sendJsonResponse(400, 'Reply cannot be empty');
      }

      const newReply = await forumCommentsReplyRepository.addReplyToComment(
        postId,
        commentId,
        userId,
        reply
      );

      if (!newReply) {
        return res.sendJsonResponse(500, 'Failed to add reply');
      }

      res.sendJsonResponse(200, 'Reply  successfully', newReply);
    })
  )
);

export default apiForumRouter;
