const { HttpError } = require('../helpers/http-error.helper');
const { verifyAuthToken } = require('../helpers/jwt.helper');
const usuarioRepository = require('../repositories/usuario.repository');

const extractBearerToken = (authorizationHeader) => {
  if (!authorizationHeader) {
    throw new HttpError(401, 'Authorization token is required.');
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new HttpError(401, 'Authorization header must use Bearer scheme.');
  }

  return token;
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);
    const payload = verifyAuthToken(token);
    const usuario = await usuarioRepository.findById(payload.sub);

    if (!usuario) {
      throw new HttpError(401, 'Authenticated user not found.');
    }

    req.auth = payload;
    req.user = usuario;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new HttpError(401, 'Invalid or expired token.'));
    }

    return next(error);
  }
};

module.exports = { authMiddleware };
