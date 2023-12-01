/* eslint-disable no-console */
const UserModel = require('../src/Users/modules/mapping');

const deleteEmptyUserOnOrg = async () => {
  try {
    const emptyUsersOnOrg = await UserModel.UserOrganization.find().populate('userId');
    const userOrgToDelete = emptyUsersOnOrg.filter((userOrg) => userOrg.userId === null);
    const userOrgIds = userOrgToDelete.map((e) => e._id);
    await UserModel.UserOrganization.deleteMany({ _id: { $in: userOrgIds } });
    console.log(`UserOrganization entries without userId deleted successfully. Deleted: ${userOrgIds.length}`);
  } catch (error) {
    console.error('Error deleting UserOrganization entries:', error);
  }
};

module.exports = deleteEmptyUserOnOrg;
