const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const flash = require('express-flash');
const expressLayouts = require('express-ejs-layouts');
const router = require('./routes/router');
const { createLoggerMiddleware } = require('./config/winston-logger.config');
const a= require('./repository/logRepository')
const app = express();

// Middleware setup
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: false }));
const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
app.use(express.static(path.join(__dirname, 'public'), { maxAge: oneWeek }));
app.use(flash());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', path.join(__dirname, 'views/layouts/withHeaderAndFooter'));
app.use(expressLayouts);


// Passport configuration
require('./config/passport.config-app')(app);

// config logging
createLoggerMiddleware(app);

// Routes setup
router.setupRouter(app);

// Error handling
require('./config/error-handler.config-app')(app);

const PORT = process.env.PORT || 5110;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

module.exports = app;
