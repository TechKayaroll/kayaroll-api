/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
const Model = require('../src/models');
const { generateUserIdByNameAndIndex } = require('../src/utils/common');

/**
 * Note:
 * If you want to update the "uniqueUserId" for existing documents and still
 * maintain uniqueness, you might consider the following approach:
 *
 * Remove the "unique: true" constraint for "uniqueUserId" in the schema temporarily.
 * Run the update operation.
 * Once all documents are updated, you can reapply the unique: true constraint.
 */
const generateEmptyUserOrgId = async () => {
  try {
    const userOrgs = await Model.UserOrganization.find()
      .populate({ path: 'userId' })
      .populate({ path: 'organizationId' });
    const orgMap = new Map();
    const promises = [];
    userOrgs.forEach((userOrg) => {
      if (!userOrg.uniqueUserId) {
        const { _id, organizationId } = userOrg;
        const orgId = organizationId.toString();
        let index;
        if (!orgMap.has(orgId)) {
          index = 0;
          orgMap.set(orgId, index);
        } else {
          index = orgMap.get(orgId) + 1;
          orgMap.set(orgId, index);
        }
        const uniqueId = generateUserIdByNameAndIndex(
          organizationId.name,
          index,
        );
        console.log(`Preparing to update _id ${_id} with uniqueUserId: ${uniqueId}.`);
        promises.push(
          Model.UserOrganization.findByIdAndUpdate(
            _id,
            { $set: { uniqueUserId: uniqueId } },
            { new: true },
          ),
        );
      }
    });
    const updated = await Promise.all(promises);
    updated.forEach((data) => console.log(data));

    console.log('uniqueUserIds generated successfully for existing data.');
  } catch (error) {
    console.error('Error generating uniqueUserIds:', error);
  }
};

module.exports = generateEmptyUserOrgId;
