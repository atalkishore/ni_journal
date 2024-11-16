import compression from "compression";
import cookieParser from "cookie-parser";
import express, { json, urlencoded } from "express";
import expressLayouts from "express-ejs-layouts";
import flash from "express-flash";
import path from "path";

import {
  PORT,
  ROOT_DIR_BASE,
  errorHandler,
  PassportConfigHandler,
} from "./config/index.js";
import {
  createLoggerMiddleware,
  LOGGER,
} from "./config/winston-logger.config.js";
import {
  connect as connectMongoDb,
  createRedisClient,
} from "./repository/index.js";
import { setupRouter } from "./routes/router.js";

const app = express();

connectMongoDb();
(async () => {
  const redisClient = await createRedisClient();

  // Example Redis operation
  await redisClient.ping();
})();
// console.log(import.meta.env.REDISDB_PASSWORD);
// Middleware setup
app.use(compression());
app.use(cookieParser());
app.use(json({ limit: "10mb" }));
app.use(urlencoded({ limit: "10mb", extended: false }));
const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
app.use(
  express.static(path.join(ROOT_DIR_BASE, "public"), { maxAge: oneWeek }),
);
app.use(flash());
app.set("views", path.join(ROOT_DIR_BASE, "views"));
app.set("view engine", "ejs");
app.set(
  "layout",
  path.join(ROOT_DIR_BASE, "views/layouts/withHeaderAndFooter"),
);
app.use(expressLayouts);

// Passport configuration
PassportConfigHandler(app);

// config logging
createLoggerMiddleware(app);

// Routes setup
setupRouter(app);

// Error handling
errorHandler(app);

const _PORT = PORT || 5110;
app.listen(_PORT, () => LOGGER.debug(`Listening on ${_PORT}`));

export default app;
