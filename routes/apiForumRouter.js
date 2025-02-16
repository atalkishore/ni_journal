import { Router } from 'express';
import asyncMiddleware from '../config/asyncMiddleware.config.js';
import { AuthenticationMiddleware } from '../config/ensureUserRole.config.js';
import { forumRepository } from '../repository/forumRepository.js';

const apiForumRouter = Router();

apiForumRouter.get(
  '/posts',
  asyncMiddleware(async (req, res) => {
    const posts = await forumRepository.getAllPosts();
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

    const newPost = await forumRepository.addPost(userId, userName, content);
    res.sendJsonResponse(200, 'Post added successfully', newPost);
  })
);

apiForumRouter.post(
  '/posts/:postId/like',
  AuthenticationMiddleware.ensureLoggedInApi(),
  asyncMiddleware(async (req, res) => {
    const { postId } = req.params;

    const updatedPost = await forumRepository.likePost(postId);

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

    const updatedPost = await forumRepository.addComment(
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

    const comments = await forumRepository.getCommentsByPost(postId);

    if (!comments || comments.length === 0) {
      return res.sendJsonResponse(404, 'No comments found for this post');
    }

    res.sendJsonResponse(200, 'Comments retrieved successfully', comments);
  })
);

export default apiForumRouter;
