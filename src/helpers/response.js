module.exports.ResponseError = class ResponseErrors extends Error {
  constructor(code, message, data = {}) {
    super(message);
    this.code = code;
    this.data = data;
  }
};
