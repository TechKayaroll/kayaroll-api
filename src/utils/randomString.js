const dayjs = require('dayjs');

const getRandomString = (length, upperCase = false, lowerCase = false) => {
  let characters = '';
  if (upperCase) characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lowerCase) characters += 'abcdefghijklmnopqrstuvwxyz';
  if (!upperCase && !lowerCase) { characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; }

  let result = '';
  const charactersLength = characters.length;
  let i = 0;
  while (i < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    i += 1;
  }
  return result;
};

const generateCodeByString = (length, string) => {
  let results = string.replaceAll(
    /[`~!@#$%^&*()|+-=?;:'",.<>{}[\]/\s]/gi,
    '',
  );
  if (results.length < length) {
    results += getRandomString(
      Math.abs(length - results.length),
      true,
    );
  }
  return results.slice(0, length).toUpperCase();
};

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

module.exports = {
  generateCodeByString,
  getRandomString,
  generateRandomString,
};
