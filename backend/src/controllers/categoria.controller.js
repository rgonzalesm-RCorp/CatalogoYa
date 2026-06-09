const categoriaService = require('../services/categoria.service');

const listCategories = async (req, res, next) => {
  try {
    const categories = await categoriaService.listStoreCategories(
      req.params.tiendaId,
      req.user.UsuarioID,
    );

    res.status(200).json({
      success: true,
      message: 'Categories fetched successfully.',
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await categoriaService.getCategoryById(
      req.params.id,
      req.user.UsuarioID,
    );

    res.status(200).json({
      success: true,
      message: 'Category fetched successfully.',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const category = await categoriaService.createCategory(
      req.params.tiendaId,
      req.body,
      req.user.UsuarioID,
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await categoriaService.updateCategory(
      req.params.id,
      req.body,
      req.user.UsuarioID,
    );

    res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await categoriaService.deleteCategory(
      req.params.id,
      req.user.UsuarioID,
    );

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully.',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
