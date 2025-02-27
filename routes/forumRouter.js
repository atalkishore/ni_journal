import { Router } from 'express';

const forumRouter = Router();
import asyncMiddleware from '../config/asyncMiddleware.config.js';
import { AuthenticationMiddleware } from '../config/ensureUserRole.config.js';
import { seoHeadTagValues, PAGE_NAME, redirectTo404 } from '../utils/index.js';

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

export default forumRouter;
