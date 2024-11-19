import apiJournalRouter from './apiJornalRouter.js';
import authRouter from './authRouter.js';
import indexRouter from './indexRouter.js';
import journalRouter from './jornalRouter.js';
// import tradeRouter from './tradeRouter.js';
import userRouter from './userRouter.js';
import { redirectTo404 } from '../utils/helpers.js';

function setupRouter(app) {
  app.use('/', indexRouter);
  try {
    app.use('/auth', authRouter);
    app.use('/user', userRouter);
    app.use('/journal/', journalRouter);
    app.use('/api/journal/', apiJournalRouter);
    // app.use('/trade/', tradeRouter);

    app.use('*', (req, res) => {
      res.status(404).render('404', {
        menu: '404',
        title: 'Not-Found',
        description: 'Server Error',
        source: '/',
        keywords: '',
      });
    });
    // eslint-disable-next-line no-unused-vars
  } catch (e) {
    return redirectTo404();
  }
}

export { setupRouter };
