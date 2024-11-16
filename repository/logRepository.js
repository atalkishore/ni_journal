import moment from "moment-timezone";
import { ObjectId } from "mongodb";

import { mongodb } from "./baseMongoDbRepository.js";
import { LOGGER } from "../config/winston-logger.config.js";

async function storeAuditLog(
  resourceType,
  resourceId,
  action,
  description,
  createdBy,
  metadata = {},
) {
  try {
    // Validate resource type
    if (!resourceType.name || !resourceType.expirationDays) {
      throw new Error("Invalid resource type");
    }

    const _db = await mongodb; // Get the database connection
    const auditLogsCollection = _db.collection("audit_logs"); // Audit logs collection
    const expirationDays = resourceType.expirationDays;
    // Construct the audit log entry
    const auditLog = {
      resource_type: resourceType.name, // e.g., ResourceType.ORDERS
      resource_id: new ObjectId(resourceId), // Convert resourceId to ObjectId if applicable
      action: action, // e.g., "update"
      description: description, // Description of the action
      created_by: new ObjectId(createdBy), // Convert createdBy to ObjectId (assuming users have ObjectIds)
      created_at: moment().utcOffset(330).toDate(), // Set current IST time (UTC +5:30)
      metadata: metadata, // Additional data related to the action
      expires_at: moment().utcOffset(330).add(expirationDays, "days").toDate(), // Expiration in 90 days in IST
    };

    // Insert the log into the audit logs collection
    const result = await auditLogsCollection.insertOne(auditLog);
    LOGGER.log(`Audit log inserted with _id: ${result.insertedId}`);

    return result.insertedId; // Return the inserted log ID
  } catch (error) {
    LOGGER.error("Error storing audit log:", error);
    throw new Error("Unable to store audit log");
  }
}
// storeAuditLog(
//     ResourceConfig.TICKETS,         // Resource type using the enum
//     '605c72c8b54764421b708b1b', // Resource ID (converted to ObjectId)
//     'update',                    // Action performed
//     'Updated order status from pending to shipped', // Description
//     '605c72c8b54764421b708b1d', // User ID (converted to ObjectId)
//     { old_status: 'pending', new_status: 'shipped' } // Metadata
// );

const getAuditLogs = async (resourceType, resourceId, action) => {
  const _db = await mongodb;
  const auditLogsCollection = _db.collection("audit_logs");

  // Build the query based on the provided parameters
  const query = {
    resource_type: resourceType,
    resource_id: new ObjectId(resourceId), // Convert to ObjectId
  };

  // If action is provided, add it to the query
  if (action) {
    query.action = action;
  }

  // Fetch the audit logs
  const logs = await auditLogsCollection
    .find(query)
    .sort({ created_at: -1 })
    .toArray();
  return logs;
};
export { storeAuditLog, getAuditLogs };
