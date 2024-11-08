const indexRouter = require('./indexRouter');
const helpers = require('../utils/helpers');

// const tutorialRouter = require('./tutorialRouter');
const authRouter = require('./authRouter');
const userRouter = require('./userRouter');
const journalRouter = require('./jornalRouter');
const apiJournalRouter = require('./apiJornalRouter');

function setupRouter(app) {
    app.use('/', indexRouter);
    try {
        app.use('/auth', authRouter);
        app.use('/user', userRouter);
        app.use('/journal/', journalRouter);
        app.use('/api/journal/', apiJournalRouter);
        app.use('*', (req, res) => {
            res.status(404).render('404', { menu: '404', title: 'Not-Found', description: 'Server Error', source: '/', keywords: '' });
        });
    }
    catch (e) {
        return helpers.redirectTo404();
    }
}

module.exports.setupRouter = setupRouter;
