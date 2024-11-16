import momentTimezone from "moment-timezone";
import { ObjectId } from "mongodb";

import { mongodb } from "./baseMongoDbRepository.js";
import { LOGGER } from "../config/winston-logger.config.js";

const countOpenTickets = async function (userId) {
  const _db = await mongodb;
  return await _db
    .collection("support_tickets")
    .countDocuments({ userId: userId, status: "open" });
};

// Method to create a support ticket
const createTicket = async function (ticketData) {
  const _db = await mongodb;
  const result = await _db.collection("support_tickets").insertOne(ticketData);
  return result.insertedId; // Return the inserted ticket ID
};

async function getTicketsByUserId(userId) {
  const _db = await mongodb;
  const ticketsCollection = _db.collection("support_tickets"); // Replace with your tickets collection name

  const tickets = await ticketsCollection
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray(); // Fetch tickets for the user
  return tickets; // Return the tickets
}

async function getPaginatedTickets(page, limit) {
  const db = await mongodb;
  const ticketsCollection = db.collection("support_tickets"); // Replace with the correct collection

  const skip = (page - 1) * limit; // Calculate how many records to skip

  // Fetch paginated tickets, sorted by status (open first), then by createdAt (newest first)
  const tickets = await ticketsCollection
    .find({ status: { $eq: "open" } })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  // Get the total count of tickets
  const totalTickets = await ticketsCollection.countDocuments();

  return { tickets, totalTickets };
}

async function updateTicketReply(ticketId, reply, replyUserId) {
  const db = await mongodb;
  const ticketsCollection = db.collection("support_tickets"); // Replace with the correct collection name

  // Update the ticket with the reply and set the status to "Closed"
  const result = await ticketsCollection.updateOne(
    { _id: new ObjectId(ticketId) },
    {
      $set: {
        reply: reply,
        status: "closed",
        updatedAt: new Date(),
        replyUserId: replyUserId,
        ttl_at: momentTimezone.utc().add(90, "days").toDate(),
      },
    },
  );

  return result; // Return the update result (modifiedCount will indicate success)
}

async function getTicketById(ticketId) {
  try {
    const _db = await mongodb; // Get the database connection
    const ticketsCollection = _db.collection("support_tickets"); // Tickets collection

    // MongoDB aggregation to join tickets with user details
    const ticket = await ticketsCollection
      .aggregate([
        { $match: { _id: new ObjectId(ticketId) } }, // Match the specific ticket by ID

        {
          $addFields: {
            userId: { $toObjectId: "$userId" }, // Convert userId from string to ObjectId
          },
        },
        {
          $lookup: {
            from: "users", // Collection to join (users collection)
            localField: "userId", // Field in tickets collection
            foreignField: "_id", // Field in users collection
            as: "user", // Alias for the joined data
          },
        },
        { $unwind: { path: "$user" } }, // Deconstruct the userDetails array
      ])
      .toArray();

    // If no ticket is found, return null
    if (ticket.length === 0) {
      return null;
    }

    return ticket[0]; // Return the first (and only) result, as _id is unique
  } catch (error) {
    LOGGER.error(`Error fetching ticket by ID: ${ticketId}`, error);
    throw new Error("Unable to fetch ticket with user details");
  }
}

export {
  countOpenTickets,
  createTicket,
  getTicketsByUserId,
  getPaginatedTickets,
  updateTicketReply,
  getTicketById,
};
