const jwtDecode = require('jwt-decode');
const httpStatus = require('http-status');
const { ResponseError } = require('./response');

const decodeToken = (token) => {
  try {
    const decodedToken = jwtDecode(token, process.env.CLIENT_SECRET);
    return decodedToken;
  } catch (e) {
    throw new ResponseError(httpStatus.BAD_REQUEST, 'Invalid Token JWT');
  }
};

module.exports = {
  decodeToken,
};
