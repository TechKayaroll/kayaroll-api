const dayjs = require('dayjs');

const generateCodeByString = (length, string) => {
  let result = '';
  let characters = string.replaceAll(/[`~!@#$%^&*()|+-=?;:'",.<>{}[]\/\s]/gi, '');
  characters = characters.replaceAll(/\s/g, '');
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result.toUpperCase();
};

const getRandomString = (length) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result.toUpperCase();
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
