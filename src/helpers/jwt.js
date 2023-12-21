const jwt = require('jsonwebtoken');
const jwtDecode = require('jwt-decode');
const { StatusCodes } = require('http-status-codes');
const { ResponseError } = require('./response');

const SECRETS = process.env.CLIENT_SECRET;

const decodeToken = (token) => {
  try {
    const decodedToken = jwtDecode(token, SECRETS);
    return decodedToken;
  } catch (e) {
    throw new ResponseError(StatusCodes.BAD_REQUEST, 'Invalid Token JWT');
  }
};

const generateJwtToken = (payload) => jwt.sign(payload, SECRETS);
const decodeJwtToken = (token) => jwt.verify(token, SECRETS);

module.exports = {
  decodeToken,
  generateJwtToken,
  decodeJwtToken,
};
