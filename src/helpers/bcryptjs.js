const bcrypt = require('bcryptjs');

const SALT_ROUND = 10;
const salt = bcrypt.genSaltSync(SALT_ROUND);

const hash = (string) => bcrypt.hashSync(string, salt);
const compare = (string, hash2) => bcrypt.compareSync(string, hash2);

module.exports = {
  hash,
  compare,
};
