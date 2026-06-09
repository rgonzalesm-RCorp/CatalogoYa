const tiendaService = require('../services/tienda.service');

const listStores = async (req, res, next) => {
  try {
    const stores = await tiendaService.listUserStores(req.user.UsuarioID);

    res.status(200).json({
      success: true,
      message: 'Stores fetched successfully.',
      data: stores,
    });
  } catch (error) {
    next(error);
  }
};

const getStoreById = async (req, res, next) => {
  try {
    const store = await tiendaService.getUserStoreById(req.params.id, req.user.UsuarioID);

    res.status(200).json({
      success: true,
      message: 'Store fetched successfully.',
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

const createStore = async (req, res, next) => {
  try {
    const store = await tiendaService.createStore(req.body, req.user.UsuarioID);

    res.status(201).json({
      success: true,
      message: 'Store created successfully.',
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

const updateStore = async (req, res, next) => {
  try {
    const store = await tiendaService.updateStore(req.params.id, req.body, req.user.UsuarioID);

    res.status(200).json({
      success: true,
      message: 'Store updated successfully.',
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

const deleteStore = async (req, res, next) => {
  try {
    const store = await tiendaService.deleteStore(req.params.id, req.user.UsuarioID);

    res.status(200).json({
      success: true,
      message: 'Store deleted successfully.',
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
};
