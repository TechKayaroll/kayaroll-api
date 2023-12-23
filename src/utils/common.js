const padNumber = (number, length) => number.toString().padStart(length, '0');

const generateRandomString = (length, type = 'alphanumeric') => {
  let characters;

  if (type === 'numeric') {
    characters = '0123456789';
  } else if (type === 'alphabetic') {
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  } else if (type === 'alphanumeric') {
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  } else {
    throw new Error('Invalid character type specified.');
  }

  let result = '';
  let i = 0;

  while (i < length) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
    i += 1;
  }

  return result;
};

const generateUserIdByNameAndIndex = (name, indexCount) => {
  const prefix = name.slice(0, 3).toUpperCase();
  const randomString = generateRandomString(2).toUpperCase();
  const paddedCounter = padNumber(indexCount + 1, 3);

  const uniqueId = `${prefix}-${randomString}${paddedCounter}`;
  return uniqueId;
};

module.exports = {
  padNumber,
  generateRandomString,
  generateUserIdByNameAndIndex,
};
