const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Define logs directory

const logsDir = path.join(__dirname, '../logs');

// Create a Winston logger instance with DailyRotateFile transport
const logger = winston.createLogger({
  level: 'info', // Set log level
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DDTHH:mm:ss.SSSZ', // Format timestamp as required
      alias:'@timestamp'
    }),
    // winston.format.metadata({ key: '@timestamp' }),
    winston.format.json()
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '100m', // Max size of each log file
      maxFiles: '7d' // Keep log files for 7 days
    })
  ],
  defaultMeta: { environment: process.env.ENVNAME }
});

logger.info("Logger Intialized Happy Logging!!!")
module.exports.createLoggerMiddleware = function (app) {

  app.use((req, res, next) => {
    req.logger = logger;
    next();
  });
}

module.exports.LOGGER = logger;