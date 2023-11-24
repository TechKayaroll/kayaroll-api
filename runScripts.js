/* eslint-disable no-console */
const environments = require('custom-env').env();
const mongoose = require('mongoose');
const { connectMongo } = require('./Services/MongoDB/mongo');
const seedRole = require('./scripts/seedRoleScripts');

environments.env(process.env.NODE_ENV || 'local', 'Environments/');

const scripts = async () => {
  await seedRole();
};

const runSeeder = async () => {
  try {
    console.log('Environtment: ', process.env.NODE_ENV, '\n');
    await connectMongo();
    await scripts();
  } catch (error) {
    console.error(error);
    mongoose.connection.close();
  } finally {
    mongoose.connection.close();
  }
};

runSeeder();
