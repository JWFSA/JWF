const pool = require('../../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (loginOrEmail, password) => {
  // Buscar en auth.usuarios por email o por login ERP vinculado
  const { rows } = await pool.query(
    `SELECT u."ID", u."NOMBRE", u."EMAIL", u."PASSWORD", u."ACTIVO",
            u."DEPARTAMENTO_ID", u."CARGO",
            o."OPER_CODIGO" AS oper_codigo, o."OPER_LOGIN" AS oper_login,
            o."OPER_IND_ADMIN" AS oper_ind_admin,
            o."OPER_EMPR" AS oper_empr, o."OPER_SUC" AS oper_suc
     FROM auth.usuarios u
     LEFT JOIN gen_operador o ON o."OPER_AUTH_ID" = u."ID"
     WHERE u."EMAIL" = $1
        OR o."OPER_LOGIN" = UPPER($1)`,
    [loginOrEmail]
  );

  if (rows.length === 0) {
    throw { status: 401, message: 'Credenciales invalidas' };
  }

  const user = rows[0];

  const valid = await bcrypt.compare(password, user.PASSWORD);
  if (!valid) {
    throw { status: 401, message: 'Credenciales invalidas' };
  }

  if (!user.ACTIVO) {
    throw { status: 401, message: 'Tu cuenta esta desactivada. Contacta al administrador.' };
  }

  // Obtener roles del usuario desde auth.usuario_rol
  const rolesResult = await pool.query(
    `SELECT r."ID" AS rol_id, r."NOMBRE" AS rol_nombre, r."CODIGO" AS rol_codigo, r."ES_ADMIN"
     FROM auth.usuario_rol ur
     JOIN auth.roles r ON r."ID" = ur."ROL_ID"
     WHERE ur."USUARIO_ID" = $1`,
    [user.ID]
  );

  // Obtener permisos de modulos para los roles del usuario
  const modulosResult = await pool.query(
    `SELECT DISTINCT pm."MODULO", pm."PUEDE_VER", pm."PUEDE_EDITAR"
     FROM auth.permisos_modulos pm
     WHERE pm."ROL_ID" IN (
       SELECT ur."ROL_ID" FROM auth.usuario_rol ur WHERE ur."USUARIO_ID" = $1
     ) AND pm."PUEDE_VER" = true`,
    [user.ID]
  );

  const isAdmin = rolesResult.rows.some(r => r.ES_ADMIN) || user.oper_ind_admin === 'S';

  const token = jwt.sign(
    {
      id: user.ID,
      email: user.EMAIL,
      nombre: user.NOMBRE,
      isAdmin,
      empresa: user.oper_empr || null,
      sucursal: user.oper_suc || null,
      roles: rolesResult.rows.map(r => ({ id: r.rol_id, codigo: r.rol_codigo, nombre: r.rol_nombre })),
      modulos: modulosResult.rows.map(m => m.MODULO),
      // Compatibilidad ERP
      codigo: user.oper_codigo || null,
      login: user.oper_login || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: user.ID,
      nombre: user.NOMBRE,
      email: user.EMAIL,
      isAdmin,
      empresa: user.oper_empr || null,
      sucursal: user.oper_suc || null,
      departamentoId: user.DEPARTAMENTO_ID,
      cargo: user.CARGO,
      roles: rolesResult.rows,
      modulos: modulosResult.rows.map(m => m.MODULO),
      // Compatibilidad ERP
      codigo: user.oper_codigo || null,
      login: user.oper_login || null,
    },
  };
};

const me = async (userId) => {
  const { rows } = await pool.query(
    `SELECT u."ID", u."NOMBRE", u."EMAIL", u."ACTIVO",
            u."DEPARTAMENTO_ID", u."CARGO", u."AVATAR_URL",
            o."OPER_CODIGO" AS oper_codigo, o."OPER_LOGIN" AS oper_login,
            o."OPER_IND_ADMIN" AS oper_ind_admin,
            o."OPER_EMPR" AS oper_empr, o."OPER_SUC" AS oper_suc
     FROM auth.usuarios u
     LEFT JOIN gen_operador o ON o."OPER_AUTH_ID" = u."ID"
     WHERE u."ID" = $1`,
    [userId]
  );

  if (rows.length === 0) return null;

  const user = rows[0];

  const rolesResult = await pool.query(
    `SELECT r."ID" AS rol_id, r."NOMBRE" AS rol_nombre, r."CODIGO" AS rol_codigo, r."ES_ADMIN"
     FROM auth.usuario_rol ur
     JOIN auth.roles r ON r."ID" = ur."ROL_ID"
     WHERE ur."USUARIO_ID" = $1`,
    [userId]
  );

  const modulosResult = await pool.query(
    `SELECT DISTINCT pm."MODULO", pm."PUEDE_VER", pm."PUEDE_EDITAR"
     FROM auth.permisos_modulos pm
     WHERE pm."ROL_ID" IN (
       SELECT ur."ROL_ID" FROM auth.usuario_rol ur WHERE ur."USUARIO_ID" = $1
     ) AND pm."PUEDE_VER" = true`,
    [userId]
  );

  const isAdmin = rolesResult.rows.some(r => r.ES_ADMIN) || user.oper_ind_admin === 'S';

  return {
    id: user.ID,
    nombre: user.NOMBRE,
    email: user.EMAIL,
    isAdmin,
    empresa: user.oper_empr || null,
    sucursal: user.oper_suc || null,
    departamentoId: user.DEPARTAMENTO_ID,
    cargo: user.CARGO,
    avatarUrl: user.AVATAR_URL,
    roles: rolesResult.rows,
    modulos: modulosResult.rows.map(m => m.MODULO),
    codigo: user.oper_codigo || null,
    login: user.oper_login || null,
  };
};

module.exports = { login, me };
