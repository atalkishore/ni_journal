import moment from 'moment-timezone';

import { mongodb } from './baseMongoDbRepository.js';
import { ENVNAME } from '../config/env.constant.js';
import { redisClient } from '../repository/baseRedisRepository.js';
import { getSecondsRemainingBeforeMidnightIST as getSecondsUntilMidnightIST } from '../utils/dateUtils.js';

async function dumpData(emailReference, fullBody) {
  const _db = await mongodb;
  _db
    .collection('dump_data')
    .insertOne({ key: `EmailHook_${emailReference}`, ...fullBody });
}
async function updateEmailStatus(
  emailReference,
  status,
  reason,
  processedTime,
  fullBody
) {
  const _db = await mongodb;
  _db.collection('email_sent').updateOne(
    { 'response.messageId': `<${emailReference}>` }, // Surround messageId with <>
    {
      $set: {
        [`${status}`]: {
          reason: reason,
          updated_at: processedTime,
          data: fullBody,
        },
      },
      $currentDate: { modified_at: true },
    }
  );
}
class UserRepository {
  static Roles = Object.freeze({
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    SUBSCRIBED_USER: 'SUBSCRIBED_USER',
  });

  static async assignRoleWithExpiry(userId, role, expiryDate, type = null) {
    try {
      const _db = await mongodb;
      // Perform the update operation directly
      const result = await _db.collection('users').updateOne(
        { _id: userId }, // Match user by _id
        {
          $set: {
            [`roles.${role}.expiryTime`]: expiryDate, // Update role expiry time
            [`roles.${role}.info`]: type,
          },
        }
      );

      // If no matching user is found, throw an error
      if (result.matchedCount === 0) {
        throw new Error('User not found');
      }

      // If no changes are made, the expiry time might already be set
      if (result.modifiedCount === 0) {
        throw new Error(`${role} role already has the same expiry time`);
      }
    } catch (error) {
      throw error;
    }

    // return { success: true, message: `${role} role assigned with expiry time ${expiryDate}` };
  }

  static async findByEmail(email) {
    const _db = await mongodb;
    return await _db.collection('users').findOne({ email: email });
  }
  static async getUserList(limit = 100) {
    const _db = await mongodb;
    return await _db
      .collection('users')
      .find({ last_loggedin: { $ne: null } }) // Exclude documents where last_loggedin is null
      .sort({ last_loggedin: -1 }) // Sort by last_loggedin in descending order
      .limit(limit) // Limit results to 100
      .toArray(); // Convert the cursor to an array
  }

  static async getUserDetailsFromRedis(userId) {
    let extraDetails = await redisClient.get(`${ENVNAME}:UserI:${userId}`);
    if (extraDetails) {
      extraDetails = JSON.parse(extraDetails);
    }
    return extraDetails;
  }
  static async storeUserDetailsFromRedis(userId, extraDetails) {
    const key = `${ENVNAME}:UserI:${userId}`;
    const EX = getSecondsUntilMidnightIST();
    await redisClient.set(key, JSON.stringify(extraDetails), { EX: EX });
  }

  static async formAndStoreExtraUserDetail(user) {
    const {
      _id,
      name,
      email,
      image = '../assets/img/team/avatar-rounded.webp',
      roles,
      userType,
    } = user;
    const now = moment().tz('Asia/Kolkata').toDate();
    const isSuperUser = userType === 'super_user' ? true : false;
    const subUser = roles?.[UserRepository.Roles.SUBSCRIBED_USER];
    const isSubscribedUser =
      isSuperUser ||
      (subUser && moment(subUser.expiryTime).tz('Asia/Kolkata').toDate() > now);
    const isAdmin =
      isSuperUser || roles?.[UserRepository.Roles.ADMIN] ? true : false;
    const isTesting = isSuperUser || userType === 'testing' ? true : false;
    const isAdDisabled = isAdmin || isSubscribedUser || isSuperUser;
    // Minimal session data

    // Extra details to store in Redis
    const extraDetails = {
      image,
      roles,
      isSubscribedUser,
      isAdmin,
      isTesting,
      isSuperUser,
      isAdDisabled,
    };

    await UserRepository.storeUserDetailsFromRedis(_id, extraDetails);
    return extraDetails;
  }
}
const _updateEmailStatus = updateEmailStatus;
export { _updateEmailStatus as updateEmailStatus };
const _dumpData = dumpData;
export { _dumpData as dumpData };
const _UserRepository = UserRepository;
export { _UserRepository as UserRepository };
