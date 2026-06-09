const { getModels } = require('../config/database');

const getUsuarioModel = () => getModels().Usuario;

const findById = async (usuarioId) => getUsuarioModel().findByPk(usuarioId);

const findByEmail = async (email) => getUsuarioModel().findOne({
  where: { Email: email },
});

const findByGoogleId = async (googleId) => getUsuarioModel().findOne({
  where: { GoogleID: googleId },
});

const createFromGoogleProfile = async (profile) => getUsuarioModel().create({
  Nombre: profile.nombre,
  Email: profile.email,
  GoogleID: profile.googleId,
  Foto: profile.foto,
  Estado: 'ACTIVO',
});

const updateFromGoogleProfile = async (usuario, profile) => usuario.update({
  Nombre: profile.nombre,
  Foto: profile.foto,
  GoogleID: profile.googleId,
  FechaModificacion: new Date(),
});

module.exports = {
  findById,
  findByEmail,
  findByGoogleId,
  createFromGoogleProfile,
  updateFromGoogleProfile,
};
