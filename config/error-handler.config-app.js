import createError from "http-errors";

import { ENVNAME } from "./env.constant.js";

function config(app) {
  if (ENVNAME !== "prod") {
    return;
  }

  app.use((err, req, res) => {
    res.locals.message = err.message;
    req.logger.error(err.message);
    res.locals.error = {};
    if (err.status === 404) {
      res.status(404).render("404", {
        menu: "404",
        title: "Not Found",
        description: "Page not found",
        source: req.originalUrl,
        keywords: "",
      });
    }
    res.status(500).render("500", {
      menu: "500",
      title: "Server Error",
      description: "Server Error",
      source: req.originalUrl,
      keywords: "",
    });
  });
  app.use((req, res, next) => {
    next(createError(500));
  });
}
export { config as errorHandler };
