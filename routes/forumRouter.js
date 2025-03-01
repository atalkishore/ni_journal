import { Router } from 'express';

const forumRouter = Router();
import asyncMiddleware from '../config/asyncMiddleware.config.js';
import { AuthenticationMiddleware } from '../config/ensureUserRole.config.js';
import { seoHeadTagValues, PAGE_NAME } from '../utils/index.js';
import { forumPostRepository } from '../repository/forum/forumPostRepository.js';

// / will list all the posts and will have featurwe to add post
// /:postId will show details of a particular post

forumRouter.get(
  '/',
  AuthenticationMiddleware.ensureLoggedIn(),
  asyncMiddleware(async (req, res) => {
    res.render('forum/forum', {
      menu: 'Forum',
      currentPath: 'forum/forum',
      ...seoHeadTagValues(PAGE_NAME.JOURNAL_DASHBOARD),
    });
  })
);

forumRouter.get(
  '/add',
  AuthenticationMiddleware.ensureLoggedIn(),
  asyncMiddleware(async (req, res) => {
    res.render('forum/addForum', {
      menu: 'Forum',
      currentPath: 'forum/forum',
      ...seoHeadTagValues(PAGE_NAME.JOURNAL_DASHBOARD),
    });
  })
);

forumRouter.get(
  '/:postId',
  AuthenticationMiddleware.ensureLoggedIn(),
  asyncMiddleware(async (req, res) => {
    const { postId } = req.params;
    const post = await forumPostRepository.getPostById(postId);

    if (!post) {
      return res.sendJsonResponse(400, 'Post not found');
    }

    res.render('forum/forumDetails', {
      menu: 'Forum',
      currentPath: `forum/${postId}`,
      post,
      ...seoHeadTagValues(PAGE_NAME.FORUM_POST_DETAIL),
    });
  })
);

export default forumRouter;
