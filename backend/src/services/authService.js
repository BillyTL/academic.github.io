const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const hashPassword = async (plain) => bcrypt.hash(plain, 10);
const comparePassword = async (plain, hash) => bcrypt.compare(plain, hash);

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });

module.exports = { hashPassword, comparePassword, signToken };
