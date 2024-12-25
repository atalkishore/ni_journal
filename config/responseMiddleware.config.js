import { encryptData } from '../utils/helpers.js';

export function responseMiddleware(app) {
  app.use((req, res, next) => {
    res.sendJsonResponse = (statusCode, message, data = null) => {
      let obj = {
        status: statusCode >= 400 ? 'error' : 'success',
        message,
        data,
      };
      if (req.isAuthenticated) {
        obj = encryptData(obj, req.user?.encKey);
      }
      res.status(statusCode).json(obj);
    };
    next();
  });
}
