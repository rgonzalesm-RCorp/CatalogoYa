const jwt = require('jsonwebtoken');

const { env } = require('../config/env');

const generateAuthToken = (usuario) => jwt.sign(
  {
    sub: usuario.UsuarioID,
    email: usuario.Email,
  },
  env.JWT_SECRET,
  {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: env.APP_NAME,
  },
);

const verifyAuthToken = (token) => jwt.verify(token, env.JWT_SECRET, {
  issuer: env.APP_NAME,
});

module.exports = {
  generateAuthToken,
  verifyAuthToken,
};
