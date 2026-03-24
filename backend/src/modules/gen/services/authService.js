const pool = require('../../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (login, password) => {
  const { rows } = await pool.query(
    `SELECT o."OPER_CODIGO" AS oper_codigo, o."OPER_NOMBRE" AS oper_nombre,
            o."OPER_APELLIDO" AS oper_apellido, o."OPER_LOGIN" AS oper_login,
            o."OPER_EMAIL" AS oper_email, o."OPER_IND_ADMIN" AS oper_ind_admin,
            o."OPER_EMPR" AS oper_empr, o."OPER_SUC" AS oper_suc,
            o."OPER_IND_DESC" AS oper_ind_desc, o."OPER_PASSWORD" AS oper_password
     FROM gen_operador o
     WHERE o."OPER_LOGIN" = $1`,
    [login]
  );

  if (rows.length === 0) {
    throw { status: 401, message: 'Credenciales inválidas' };
  }

  const operador = rows[0];

  if (!operador.oper_password) {
    throw { status: 401, message: 'Credenciales inválidas' };
  }

  const valid = await bcrypt.compare(password, operador.oper_password);
  if (!valid) {
    throw { status: 401, message: 'Credenciales inválidas' };
  }

  if (operador.oper_ind_desc === 'S') {
    throw { status: 401, message: 'Tu cuenta está desactivada. Contactá al administrador.' };
  }

  const rolesResult = await pool.query(
    `SELECT r."ROL_CODIGO" AS rol_codigo, r."ROL_NOMBRE" AS rol_nombre
     FROM gen_operador_rol opr
     JOIN gen_rol r ON r."ROL_CODIGO" = opr."OPRO_ROL"
     WHERE opr."OPRO_OPERADOR" = $1`,
    [operador.oper_codigo]
  );

  const token = jwt.sign(
    {
      codigo: operador.oper_codigo,
      login: operador.oper_login,
      nombre: operador.oper_nombre,
      apellido: operador.oper_apellido,
      isAdmin: operador.oper_ind_admin === 'S',
      empresa: operador.oper_empr,
      sucursal: operador.oper_suc,
      roles: rolesResult.rows.map((r) => r.rol_codigo),
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      codigo: operador.oper_codigo,
      nombre: `${operador.oper_nombre} ${operador.oper_apellido || ''}`.trim(),
      login: operador.oper_login,
      email: operador.oper_email,
      isAdmin: operador.oper_ind_admin === 'S',
      empresa: operador.oper_empr,
      sucursal: operador.oper_suc,
      roles: rolesResult.rows,
    },
  };
};

module.exports = { login };
