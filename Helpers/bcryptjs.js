const bcrypt = require('bcryptjs');

const SALT_ROUND = 10;
const salt = bcrypt.genSaltSync(SALT_ROUND);

const hash = (string) => bcrypt.hashSync(string, salt);
const compare = (hash1, hash2) => bcrypt.compareSync(hash1, hash2);

module.exports = {
  hash,
  compare,
};
