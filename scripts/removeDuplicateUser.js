/* eslint-disable no-console */
const UserModel = require('../src/Users/modules/mapping');

const deleteDuplicateUsers = async () => {
  try {
    const duplicateUsers = await UserModel.User.aggregate([
      {
        $group: {
          _id: '$email',
          ids: { $push: '$_id' },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ]);

    const promises = duplicateUsers.map(async (duplicate) => {
      const userIdToDelete = duplicate.ids.slice(0, -1); // Delete all but the last created user
      await UserModel.User.deleteMany({ _id: { $in: userIdToDelete } });
    });

    await Promise.all(promises);

    console.log('Duplicate users deleted successfully.');
  } catch (error) {
    console.error('Error deleting duplicate users:', error);
  }
};

module.exports = deleteDuplicateUsers;
