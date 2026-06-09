const { OAuth2Client } = require('google-auth-library');

const { env } = require('../config/env');
const { HttpError } = require('../helpers/http-error.helper');
const { generateAuthToken } = require('../helpers/jwt.helper');
const usuarioRepository = require('../repositories/usuario.repository');

let googleClient;

const getGoogleClient = () => {
  if (!googleClient) {
    googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  }

  return googleClient;
};

const buildGoogleProfile = (payload) => {
  if (!payload || !payload.sub || !payload.email) {
    throw new HttpError(401, 'Invalid Google token.');
  }

  if (!payload.email_verified) {
    throw new HttpError(401, 'Google account email must be verified.');
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    nombre: payload.name || payload.given_name || payload.email.split('@')[0],
    foto: payload.picture || null,
  };
};

const verifyGoogleIdToken = async (idToken) => {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new HttpError(500, 'GOOGLE_CLIENT_ID is not configured.');
  }

  if (!idToken) {
    throw new HttpError(400, 'idToken is required.');
  }

  let ticket;

  try {
    ticket = await getGoogleClient().verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
  } catch (error) {
    throw new HttpError(401, 'Google token is invalid.');
  }

  return buildGoogleProfile(ticket.getPayload());
};

const serializeUser = (usuario) => ({
  UsuarioID: usuario.UsuarioID,
  Nombre: usuario.Nombre,
  Email: usuario.Email,
  GoogleID: usuario.GoogleID,
  Foto: usuario.Foto,
  Estado: usuario.Estado,
  FechaCreacion: usuario.FechaCreacion,
  FechaModificacion: usuario.FechaModificacion,
});

const authenticateWithGoogle = async ({ idToken } = {}) => {
  const profile = await verifyGoogleIdToken(idToken);

  let usuario = await usuarioRepository.findByGoogleId(profile.googleId);

  if (!usuario) {
    usuario = await usuarioRepository.findByEmail(profile.email);
  }

  if (!usuario) {
    usuario = await usuarioRepository.createFromGoogleProfile(profile);
  } else {
    usuario = await usuarioRepository.updateFromGoogleProfile(usuario, profile);
  }

  return {
    token: generateAuthToken(usuario),
    tokenType: 'Bearer',
    expiresIn: env.JWT_EXPIRES_IN,
    user: serializeUser(usuario),
  };
};

const getAuthenticatedUser = async (usuarioId) => {
  const usuario = await usuarioRepository.findById(usuarioId);

  if (!usuario) {
    throw new HttpError(404, 'User not found.');
  }

  return serializeUser(usuario);
};

module.exports = {
  authenticateWithGoogle,
  getAuthenticatedUser,
  serializeUser,
};
