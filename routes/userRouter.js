/* eslint-disable import/order */
import { Router } from 'express';

const router = Router();
import { ensureLoggedIn } from 'connect-ensure-login';

import asyncMiddleware from '../config/asyncMiddleware.config.js';
import { mongodb } from '../repository/baseMongoDbRepository.js';
import { seoHeadTagValues } from '../utils/index.js';

router.get(
  '/',
  asyncMiddleware(async function (req, res) {
    return res.redirect('/profile');
  })
);

const renderSettingPage = async (res, message, formdata) => {
  const commonVariables = { menu: '', ...seoHeadTagValues('') };
  res.render('authentication/settings', {
    message,
    fname: formdata?.name,
    femail: formdata?.email,
    ...commonVariables,
  });
};

router.get(
  '/settings',
  ensureLoggedIn('/auth/login'),
  asyncMiddleware(async function (req, res) {
    renderSettingPage(res, { text: '', type: '' }, null);
  })
);

// profile page
router.get(
  '/profile',
  ensureLoggedIn('/auth/login'),
  asyncMiddleware(async function (req, res) {
    const _db = await mongodb;
    const existingUser = await _db
      .collection('users')
      .findOne({ email: req.user?.email });
    const commonVariables = { menu: '', ...seoHeadTagValues('') };
    res.render('authentication/profile', {
      formdata: existingUser,
      ...commonVariables,
    });
  })
);

export default router;
