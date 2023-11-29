/* eslint-disable no-console */
const UserModel = require('../src/Users/modules/mapping');

const deleteUsersWithoutOrganization = async () => {
  try {
    const usersWithoutOrganization = await UserModel.UserOrganization.find({
      organizationId: null,
    });
    const userIdsToDelete = usersWithoutOrganization.map((user) => user.userId);
    await UserModel.UserOrganization.deleteMany({ userId: { $in: userIdsToDelete } });

    console.log('UserOrganization entries without organizationId deleted successfully.');
  } catch (error) {
    console.error('Error deleting UserOrganization entries:', error);
  }
};

module.exports = deleteUsersWithoutOrganization;
