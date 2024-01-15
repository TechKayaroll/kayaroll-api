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

const generateCompanyCode = (companyName) => {
  const companyCode = generateCodeByString(3, companyName);
  const rndStr = getRandomString(3);
  return `${companyCode}-${rndStr}-${dayjs(Date.now()).format('DDMMYY')}`;
};

module.exports = {
  generateCodeByString,
  getRandomString,
  generateCompanyCode,
};
