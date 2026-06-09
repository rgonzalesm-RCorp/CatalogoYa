const productoService = require('../services/producto.service');

const listProducts = async (req, res, next) => {
  try {
    const products = await productoService.listStoreProducts(
      req.params.tiendaId,
      req.user.UsuarioID,
    );

    res.status(200).json({
      success: true,
      message: 'Products fetched successfully.',
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productoService.getProductById(
      req.params.id,
      req.user.UsuarioID,
    );

    res.status(200).json({
      success: true,
      message: 'Product fetched successfully.',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await productoService.createProduct(
      req.params.tiendaId,
      req.body,
      req.user.UsuarioID,
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productoService.updateProduct(
      req.params.id,
      req.body,
      req.user.UsuarioID,
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await productoService.deleteProduct(
      req.params.id,
      req.user.UsuarioID,
    );

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
