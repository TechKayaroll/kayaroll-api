/* eslint-disable no-console */
const Model = require('../src/models');

const assignEmployeeRoleToUser = async () => {
  try {
    // Find users with roleId as null or undefined
    const usersWithoutRole = await Model.User.find({ roleId: { $in: [null, undefined] } });

    if (usersWithoutRole.length === 0) {
      console.log('No users found without a role.');
      return;
    }

    // Find the role with the name 'employee'
    const employeeRole = await Model.Role.findOne({ name: 'employee' });

    if (!employeeRole) {
      console.log('Role with name "employee" not found.');
      return;
    }

    // Assign the 'employee' role to users without a role
    const updatePromises = usersWithoutRole.map(async (user) => {
      await Model.User.updateOne(
        { _id: user._id },
        { $set: { roleId: employeeRole._id } },
      );
      const updatedUser = await Model.User.findById(user._id);
      console.log('Updated user:', updatedUser); // Log the updated user details
    });

    await Promise.all(updatePromises);

    console.log('Role assigned to users successfully.');
  } catch (error) {
    console.error('Error assigning role to users:', error.message);
  }
};
module.exports = assignEmployeeRoleToUser;
