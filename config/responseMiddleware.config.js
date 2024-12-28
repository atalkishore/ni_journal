import { ENVNAME } from './env.constant.js';
import { encryptData } from '../utils/helpers.js';

export function responseMiddleware(app) {
  app.use((req, res, next) => {
    res.jsonAlt = res.json;
    res.sendJsonResponse = (statusCode, message, data = null) => {
      let obj = {
        status: statusCode >= 400 ? 'error' : 'success',
        message,
        data,
      };
      if (req.isAuthenticated) {
        obj = encryptData(obj, req.user?.encKey);
      }
      res.status(statusCode).jsonAlt(obj);
    };
    if (ENVNAME !== 'prod') {
      res.json = () => {
        res.status(500).jsonAlt({
          status: 'error',
          message: 'use sendJsonResponse instead',
        });
      };
    }
    next();
  });
}
