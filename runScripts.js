/* eslint-disable no-console */
const environments = require('custom-env').env();
const mongoose = require('mongoose');
const { connectMongo } = require('./Services/MongoDB/mongo');
const seedRole = require('./scripts/seedRoleScripts');
const generateUniqueUserIdOnAttendance = require('./scripts/generateUniqueUserIdOnAttendance');
// const deleteDuplicateUsers = require('./scripts/removeDuplicateUser');
// const deleteUsersWithoutOrganization = require('./scripts/removeEmptyOrganization');
// const deleteAttendanceWithoutEmployee = require('./scripts/removeAttendanceWithoutEmployee');
// const deleteEmptyUserOnOrg = require('./scripts/removeEmptyUserOnOrganization');
const generateEmptyUserOrgId = require('./scripts/generateEmptyUserOrgId');
const assignEmployeeRoleToUser = require('./scripts/assignEmployeeRoleToUser');

environments.env(process.env.NODE_ENV || 'local', 'Environments/');

const scripts = async () => {
  // await seedRole();
  // await deleteDuplicateUsers();
  // await deleteUsersWithoutOrganization();
  // await deleteAttendanceWithoutEmployee();
  // await deleteEmptyUserOnOrg();

  // await generateEmptyUserOrgId();
  // await generateUniqueUserIdOnAttendance();
  // await assignEmployeeRoleToUser();
};

const runSeeder = async () => {
  try {
    console.log('Environtment: ', process.env.NODE_ENV, '\n');
    const conn = await connectMongo();
    console.log(conn);
    await scripts();
  } catch (error) {
    console.error(error);
    mongoose.connection.close();
  } finally {
    mongoose.connection.close();
  }
};

runSeeder();
