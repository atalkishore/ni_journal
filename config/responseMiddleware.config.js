export function responseMiddleware(app) {
  app.use((req, res, next) => {
    res.sendJsonResponse = (statusCode, message, data = null) => {
      res.status(statusCode).json({
        status: statusCode >= 400 ? 'error' : 'success',
        message,
        data,
      });
    };
    next();
  });
}
