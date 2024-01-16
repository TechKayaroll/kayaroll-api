const dayjs = require('dayjs');
const { generateRandomString, generateCodeByString, getRandomString } = require('./randomString');

const padNumber = (number, length) => number.toString().padStart(length, '0');

const generateUserIdByNameAndIndex = (name, indexCount) => {
  const prefix = generateCodeByString(3, name);
  const randomString = generateRandomString(2).toUpperCase();
  const paddedCounter = padNumber(indexCount + 1, 3);

  const uniqueId = `${prefix}-${randomString}${paddedCounter}`;
  return uniqueId;
};
const generateCompanyCode = (companyName) => {
  const companyCode = generateCodeByString(3, companyName);
  const rndStr = getRandomString(3);
  return `${companyCode}-${rndStr}-${dayjs(Date.now()).format('DDMMYY')}`;
};

module.exports = {
  padNumber,
  generateUserIdByNameAndIndex,
  generateCompanyCode,
};
