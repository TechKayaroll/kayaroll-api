/* eslint-disable no-console */
const mongoose = require('mongoose');
const UserModel = require('../src/Users/modules/mapping');

const roleSeeds = async () => {
  const ROLE_SEEDS = ['admin', 'employee'];

  const promises = ROLE_SEEDS.map(async (roleName) => {
    const existingRole = await UserModel.Role.findOne({ name: roleName });

    if (!existingRole) {
      const newRole = new UserModel.Role({ _id: new mongoose.Types.ObjectId(), name: roleName });
      await newRole.save();
      console.log(`Role '${roleName}' seeded successfully.`);
    } else {
      console.log(`Role '${roleName}' already exists. Skipped seeding.`);
    }
  });

  try {
    await Promise.all(promises);
    console.log('Seeding completed.');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

module.exports = roleSeeds;
