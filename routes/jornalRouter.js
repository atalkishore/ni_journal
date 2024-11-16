import { Router } from "express";

const router = Router();
import asyncMiddleware from "../config/asyncMiddleware.config.js";
import { PAGE_NAME } from "../utils/constants.js";
import { seoHeadTagValues } from "../utils/index.js";

router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    res.render("journal/main", {
      menu: "Journal",
      ...seoHeadTagValues(PAGE_NAME.HOME),
    });
  }),
);

export default router;
