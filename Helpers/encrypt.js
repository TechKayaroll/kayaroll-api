const crypto = require('node:crypto');
const { StatusCodes } = require('http-status-codes');
const { ResponseError } = require('./response');

module.exports.EncryptToken = async (payload) => {
  try {
    const keys = crypto.scryptSync(process.env.CIPHER_KEY, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', keys, process.env.LOGIN_IV);
    let encryptedData = cipher.update(payload, 'utf8', 'base64');
    encryptedData += cipher.final('base64');

    return encryptedData;
  } catch (e) {
    throw new ResponseError(StatusCodes.BAD_REQUEST, 'Invalid Encrypt Token');
  }
};

module.exports.DecryptToken = async (token) => {
  try {
    const keys = crypto.scryptSync(process.env.CIPHER_KEY, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', keys, process.env.LOGIN_IV);
    let decryptedData = decipher.update(token, 'base64', 'utf8');
    decryptedData += decipher.final('utf8');

    return decryptedData;
  } catch (e) {
    throw new ResponseError(StatusCodes.UNAUTHORIZED, 'Invalid Token');
  }
};
