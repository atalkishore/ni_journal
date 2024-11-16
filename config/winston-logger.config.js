import path from 'path';
import {
  createLogger,
  format as _format,
  transports as _transports,
} from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { ENVNAME, ROOT_DIR_BASE } from './env.constant.js';

// Define logs directory

const logsDir = path.join(ROOT_DIR_BASE, '../logs');

// Create a Winston logger instance with DailyRotateFile transport
const logger = createLogger({
  level: 'debug', // Set log level
  format: _format.combine(
    _format.timestamp({
      format: 'YYYY-MM-DDTHH:mm:ss.SSSZ', // Format timestamp as required
      alias: '@timestamp',
    }),
    // winston.format.metadata({ key: '@timestamp' }),
    _format.json()
  ),
  transports: [
    new DailyRotateFile({
      level: 'info',
      filename: path.join(logsDir, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '100m', // Max size of each log file
      maxFiles: '7d', // Keep log files for 7 days
    }),
    new _transports.Console({
      level: 'silly', // Only log debug messages in console
      format: _format.combine(
        _format.colorize(), // Add colors for better readability in console
        _format.printf(({ level, message }) => `${level}: ${message}`)
      ),
    }),
  ],
  defaultMeta: { environment: ENVNAME },
});

logger.debug('Logger Intialized Happy Logging!!!');
export function createLoggerMiddleware(app) {
  app.use((req, res, next) => {
    req.logger = logger;
    next();
  });
}

export const LOGGER = logger;
