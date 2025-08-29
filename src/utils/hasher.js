const crypto = require('crypto');

/**
 * Generates a SHA256 hash for an object.
 * The object is first stringified to ensure consistent hashing.
 * @param {object} data The object to hash.
 * @returns {string} The SHA256 hash in hexadecimal format.
 */
function createHash(data) {
  const dataString = JSON.stringify(data); // Ensure consistent string representation
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

module.exports = {
  createHash,
};