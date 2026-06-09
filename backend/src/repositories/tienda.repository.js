const { Op } = require('sequelize');

const { getModels } = require('../config/database');

const getTiendaModel = () => getModels().Tienda;

const findAllByUsuarioId = async (usuarioId) => getTiendaModel().findAll({
  where: {
    UsuarioID: usuarioId,
    Estado: true,
  },
  order: [['FechaCreacion', 'DESC']],
});

const findByIdAndUsuarioId = async (tiendaId, usuarioId) => getTiendaModel().findOne({
  where: {
    TiendaID: tiendaId,
    UsuarioID: usuarioId,
    Estado: true,
  },
});

const findActiveBySlug = async (slug) => getTiendaModel().findOne({
  where: {
    Slug: slug,
    Estado: true,
  },
});

const findBySlug = async (slug, excludeTiendaId) => {
  const where = { Slug: slug };

  if (excludeTiendaId) {
    where.TiendaID = {
      [Op.ne]: excludeTiendaId,
    };
  }

  return getTiendaModel().findOne({ where });
};

const findByTokenPublico = async (tokenPublico) => getTiendaModel().findOne({
  where: { TokenPublico: tokenPublico },
});

const createTienda = async (payload) => getTiendaModel().create(payload);

const updateTienda = async (tienda, payload) => tienda.update(payload);

const softDeleteTienda = async (tienda) => tienda.update({
  Estado: false,
  FechaModificacion: new Date(),
});

module.exports = {
  findAllByUsuarioId,
  findByIdAndUsuarioId,
  findActiveBySlug,
  findBySlug,
  findByTokenPublico,
  createTienda,
  updateTienda,
  softDeleteTienda,
};
