const authService = require('../services/authService');

const login = async (req, res, next) => {
  try {
    const { login, email, password } = req.body;
    const loginOrEmail = email || login;
    if (!loginOrEmail || !password) {
      return res.status(400).json({ message: 'Email/login y contrasena requeridos' });
    }
    const result = await authService.login(loginOrEmail, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await authService.me(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

module.exports = { login, me };
