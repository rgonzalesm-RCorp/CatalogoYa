const publicCatalogoService = require('../services/public-catalogo.service');

const getPublicCatalogBySlug = async (req, res, next) => {
  try {
    const catalog = await publicCatalogoService.getPublicCatalogBySlug(req.params.slug);

    res.status(200).json({
      success: true,
      message: 'Public catalog fetched successfully.',
      data: catalog,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicCatalogBySlug,
};
