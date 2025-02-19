import moment from 'moment-timezone';
import { ObjectId } from 'mongodb';
import { baseRepository, connect } from './baseMongoDbRepository.js';

const collectionName = 'journal_guest_users';

class JournalGuestRepository {
  static async findOrCreateGuest(userId, name, email) {
    const db = await connect();
    const objectUserId = new ObjectId(userId);

    let guestUser = await db
      .collection(collectionName)
      .findOne({ userId: objectUserId });

    if (!guestUser) {
      guestUser = {
        userId: objectUserId,
        name,
        email,
        createdAt: moment().utcOffset(330).toDate(),
      };
      await baseRepository.insertOne(collectionName, guestUser);
    }
    return guestUser;
  }

  static async getGuestById(userId) {
    return await baseRepository.findOne(collectionName, {
      userId: new ObjectId(userId),
    });
  }

  static async getAllGuests() {
    return await baseRepository.find(
      collectionName,
      {},
      { sort: { createdAt: -1 } }
    );
  }

  static async deleteGuest(userId) {
    return await baseRepository.deleteOne(collectionName, {
      userId: new ObjectId(userId),
    });
  }
}

export { JournalGuestRepository };
