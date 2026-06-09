const authService = require('../services/auth.service');

const authenticateWithGoogle = async (req, res, next) => {
  try {
    const result = await authService.authenticateWithGoogle(req.body);

    res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = authService.serializeUser(req.user);

    res.status(200).json({
      success: true,
      message: 'Authenticated user fetched successfully.',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticateWithGoogle,
  getCurrentUser,
};
