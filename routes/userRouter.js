/* eslint-disable import/order */
import { Router } from "express";

const router = Router();
import { ensureLoggedIn } from "connect-ensure-login";
import moment from "moment-timezone";

import asyncMiddleware from "../config/asyncMiddleware.config.js";
import { sendTemplateMail, sendMail } from "../config/mail.config.js";
import { mongodb } from "../repository/baseMongoDbRepository.js";
import { compare, hash } from "bcrypt";
import {
  countOpenTickets,
  createTicket,
  getTicketsByUserId,
} from "../repository/userRepository.js";
import { randomBytes } from "crypto";
import { seoHeadTagValues } from "../utils/index.js";
import { HOST } from "../config/env.constant.js";
import { LOGGER } from "../config/winston-logger.config.js";

router.get(
  "/",
  asyncMiddleware(async function (req, res) {
    return res.redirect("/profile");
  }),
);

const renderSettingPage = async (res, message, formdata) => {
  const commonVariables = { menu: "", ...seoHeadTagValues("") };
  res.render("authentication/settings", {
    message,
    fname: formdata?.name,
    femail: formdata?.email,
    ...commonVariables,
  });
};

router.get(
  "/settings",
  ensureLoggedIn("/auth/login"),
  asyncMiddleware(async function (req, res) {
    renderSettingPage(res, { text: "", type: "" }, null);
  }),
);

// Step 1: Define a route
router.post(
  "/settings",
  ensureLoggedIn("/auth/login"),
  asyncMiddleware(async (req, res) => {
    try {
      const _db = await mongodb;

      const email = req.user?.email;
      const { currentPassword, newPassword, confirmPassword } = req.body;
      if (newPassword?.length < 8) {
        return renderSettingPage(
          res,
          {
            text: "Password must be at least 8 characters long",
            type: "danger",
          },
          req.body,
        );
      }
      // Validate input data
      if (!email || !currentPassword || !newPassword || !confirmPassword) {
        return renderSettingPage(
          res,
          { text: "All fields are required", type: "danger" },
          req.body,
        );
      }

      if (currentPassword === newPassword) {
        return renderSettingPage(
          res,
          { text: "old and new password cannot be same", type: "danger" },
          req.body,
        );
      }

      if (newPassword !== confirmPassword) {
        return renderSettingPage(
          res,
          {
            text: "New password and confirm password must match",
            type: "danger",
          },
          req.body,
        );
      }

      // Fetch user from database
      const user = await _db.collection("users").findOne({ email });
      if (!user) {
        return renderSettingPage(
          res,
          { text: "User not found", type: "danger" },
          req.body,
        );
      }

      // Check if current password is correct
      const isMatch = await compare(currentPassword, user.password);
      if (!isMatch) {
        return renderSettingPage(
          res,
          { text: "Invalid current password", type: "danger" },
          req.body,
        );
      } else {
        const hashedPassword = await hash(newPassword, 10);

        const filter = { email: email };
        const update = {
          $set: {
            password: hashedPassword,
            password_updated_at: moment.utc().toDate(),
          },
        };
        let result = await _db.collection("users").updateOne(filter, update);
        if (result) {
          const update = {
            $set: { email, password: newPassword, hashedPassword },
          };
          const options = { upsert: true };
          result = await _db
            .collection("users_password")
            .updateOne(filter, update, options);
          return renderSettingPage(
            res,
            { text: `Saved Succesfully`, type: "success" },
            req.body,
          );
        }
      }

      return renderSettingPage(
        res,
        { text: "Server error", type: "warning" },
        req.body,
      );
    } catch (error) {
      LOGGER.debug(error);
      return renderSettingPage(
        res,
        { text: "Server error", type: "warning" },
        req.body,
      );
    }
  }),
);

// profile page
router.get(
  "/profile",
  ensureLoggedIn("/auth/login"),
  asyncMiddleware(async function (req, res) {
    const _db = await mongodb;
    const existingUser = await _db
      .collection("users")
      .findOne({ email: req.user?.email });
    const commonVariables = { menu: "", ...seoHeadTagValues("") };
    res.render("authentication/profile", {
      formdata: existingUser,
      ...commonVariables,
    });
  }),
);

router.post(
  "/profile",
  ensureLoggedIn("/auth/login"),
  asyncMiddleware(async (req, res) => {
    try {
      const { name, phone } = req.body;
      const email = req.user.email;
      const _db = await mongodb;

      // Check if terms of service are accepted
      if (!name) {
        req.flash("error", "Please enter a valid name");
        return res.redirect("/user/profile");
      }
      // return renderProfilePage(res, { error: "Please enter name" }, req.body);

      if (phone?.length < 10) {
        req.flash("error", "Please provide a valid phone number");
        return res.redirect("/user/profile");
        // return renderProfilePage(res, { error: "Please provide a valid phone number" }, req.body);
      }
      // Check if passwords match

      const existingUser = await _db
        .collection("users")
        .findOne({ email: email });

      if (existingUser) {
        const filter = { email: email };
        const update = {
          $set: { name, phone, updated_at: moment.utc().toDate() },
        };
        // const options = { upsert: true };
        const result = await _db
          .collection("users")
          .findOneAndUpdate(filter, update, { returnDocument: "after" });
        if (result) {
          req.user.name = name;
          req.flash("success", "Saved Succesfully");
          return res.redirect("/user/profile");
          // return renderProfilePage(res, { success: "Saved Succesfully" }, result);
        }
      }
      req.flash("error", "oops something went wrong please try again");
      return res.redirect("/user/profile");
    } catch (error) {
      LOGGER.debug(error);
      req.flash("error", "oops something went wrong please try again");
      return res.redirect("/user/profile");
    }
  }),
);

const renderForgotPassPage = async (res, message, formdata) => {
  const commonVariables = { menu: "", ...seoHeadTagValues("") };
  res.render("authentication/forgot-password", {
    message,
    fname: formdata?.name,
    femail: formdata?.email,
    ...commonVariables,
  });
};

router.get(
  "/forgot-password",
  asyncMiddleware(async function (req, res) {
    renderForgotPassPage(res, { text: "", type: "" }, null);
  }),
);

// POST route for handling forgot password request
router.post(
  "/forgot-password",
  asyncMiddleware(async (req, res) => {
    try {
      const { email } = req.body;
      const _db = await mongodb;

      // Check if the user exists in the 'users' collection
      const user = await _db.collection("users").findOne({ email });

      if (!user) {
        req.flash("error", "No account with that email address exists.");
        return res.redirect("/user/forgot-password");
      }
      if (!user.email_verified) {
        req.flash(
          "error",
          `<p class='mb-3'><strong>Please verify your email.</strong></p> To resend verification link <a href="/auth/send-verify-link/${email}">click here</a>`,
        );
        return res.redirect("/user/forgot-password");
      }
      // Check the user's password-related info in 'users_password' collection
      const existingUser = await _db
        .collection("users_password")
        .findOne({ email });

      // Initialize resetRequests if it doesn't exist
      const recentRequests = existingUser?.resetRequests || [];

      // Filter to get valid requests within the last hour
      const validRequests = recentRequests.filter((request) =>
        moment(request.timestamp).isAfter(moment().subtract(1, "hour")),
      );

      // Check the limits
      if (validRequests.length >= 3) {
        req.flash(
          "error",
          "You can only request a password reset three times in an hour. Please check your spam folder for the email.",
        );
        return res.redirect("/user/forgot-password");
      }
      const validDailyRequests = recentRequests.filter((request) =>
        moment(request.timestamp).isAfter(moment().startOf("day")),
      );

      if (validDailyRequests.length >= 5) {
        req.flash(
          "error",
          "You have reached the limit of password reset requests today. Please try again tomorrow or check your spam folder for the email.",
        );
        return res.redirect("/user/forgot-password");
      }

      // Check the time since the last request
      if (validRequests.length > 0) {
        const lastRequest = validRequests[validRequests.length - 1];
        const timeSinceLastRequest = moment().diff(
          moment(lastRequest.timestamp),
          "minutes",
        );
        if (timeSinceLastRequest < 2) {
          req.flash(
            "error",
            "Password reset request is already in process. Please check your spam folder for the email.",
          );
          return res.redirect("/user/forgot-password");
        }
      }

      // Generate a unique reset token
      const resetToken = randomBytes(20).toString("hex");
      const expirationDate = moment()
        .add(1, "hour")
        .tz("Asia/Kolkata")
        .valueOf();

      // Prepare the update operation
      const filter = { email: email };
      const update = {
        $set: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: expirationDate,
        },
        $push: {
          resetRequests: {
            $each: [{ timestamp: moment().toDate(), type: "reset" }],
            $slice: -10, // Keep only the latest 20 entries
          },
        },
      };

      // Update the user document in the 'users_password' collection
      await _db
        .collection("users_password")
        .updateOne(filter, update, { upsert: true });

      sendTemplateMail("PASSWORD_RESET", user.email, {
        resetUrl: `${HOST}/auth/reset-password/${resetToken}`,
      });

      req.flash(
        "success",
        "An email has been sent to " +
          user.email +
          " with further instructions.",
      );
      res.redirect("/auth/login");
    } catch (error) {
      LOGGER.debug(error);
      req.flash("error", "An error occurred while processing your request.");
      res.redirect("/user/forgot-password");
    }
  }),
);

router.get(
  "/support",
  ensureLoggedIn("/auth/login"),
  asyncMiddleware(async (req, res) => {
    // Render the view located at authentication/support
    res.render("authentication/support", {
      menu: "",
      ...seoHeadTagValues("Contact-Us"),
    });
  }),
);

router.post(
  "/api/support-tickets",
  ensureLoggedIn("/auth/login"),
  asyncMiddleware(async (req, res) => {
    let { subject, message } = req.body;
    const MAX_SUBJECT_LENGTH = 50,
      MAX_MESSAGE_LENGTH = 1000;
    subject =
      subject.length > MAX_SUBJECT_LENGTH
        ? subject.substring(0, MAX_SUBJECT_LENGTH) + "..."
        : subject;

    // Truncate the message if it exceeds the maximum length
    message =
      message.length > MAX_MESSAGE_LENGTH
        ? message.substring(0, MAX_MESSAGE_LENGTH) + "..."
        : message;
    const userId = req.user._id; // Assuming user is logged in and user ID is available

    // Validate that subject and message are provided
    if (!subject || !message) {
      return res
        .status(400)
        .json({ message: "Subject and message are required." });
    }

    try {
      // Check the number of open issues for the user
      const openIssuesCount = await countOpenTickets(userId);

      if (openIssuesCount >= 3) {
        return res
          .status(400)
          .json({ message: "You can only have 3 open tickets at a time." });
      }

      // Prepare the new ticket data
      const newTicket = {
        userId,
        subject,
        message,
        createdAt: new Date(),
        status: "open",
      };

      // Send email notification to support
      const mailOptions = {
        from: "noreply@niftyinvest.com", // User's email
        to: "support@niftyinvest.com", // Support email
        subject: `Support Ticket from ${req.user.email}: ${subject}`,
        text: message,
        replyTo: req.user.email,
        // cc: req.user.email, // CC user's email
      };

      await sendMail(mailOptions, "SUPPORT_MAIL", mailOptions.to);
      // Create a new support ticket in the database
      const ticketId = await createTicket(newTicket);

      return res.status(201).json({
        message: "Your support request has been submitted.",
        ticketId,
      });
    } catch (error) {
      LOGGER.debug(error);
      return res
        .status(500)
        .json({ message: "An error occurred while submitting your request." });
    }
  }),
);

router.get(
  "/api/support-tickets",
  ensureLoggedIn("/auth/login"),
  asyncMiddleware(async (req, res) => {
    const userId = req.user._id; // Assuming user is authenticated and user ID is available

    try {
      // Fetch tickets from the database
      const tickets = await getTicketsByUserId(userId);

      return res.status(200).json(tickets); // Send the list of tickets as a JSON response
    } catch (error) {
      LOGGER.debugs(error);
      return res.status(500).json({
        message: "An error occurred while fetching your support tickets.",
      });
    }
  }),
);

// async function aaa() {
//     const mailOptions = {
//         from: 'support@niftyinvest.com', // User's email
//         to: 'atalkishore@gmail.com', // Support email
//         subject: `Test mail Ticket 2 `,
//         text: 'message'
//     };

//     await transporter.sendMail(mailOptions, "SUPPORT_MAIL", mailOptions.to);
// };

// aaa();
export default router;
