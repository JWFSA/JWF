const authService = require('../services/authService');

const login = async (req, res, next) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) {
      return res.status(400).json({ message: 'Login y contraseña requeridos' });
    }
    const result = await authService.login(login, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const me = (req, res) => {
  res.json(req.user);
};

module.exports = { login, me };
