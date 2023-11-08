module.exports.ResponseError = class ResponseErrors extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}