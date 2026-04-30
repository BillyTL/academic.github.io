const pool = require('../config/db');
const { hashPassword, comparePassword, signToken } = require('../services/authService');
const { ok, badRequest, unauthorized, serverError } = require('../utils/responseHandler');
const { isEmail, isNonEmpty } = require('../utils/validators');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!isEmail(email) || !isNonEmpty(password)) {
      return badRequest(res, 'Email y contrasena son obligatorios');
    }

    const [rows] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.password, u.status, r.name AS role
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.email = ? LIMIT 1`,
      [email.trim()]
    );

    if (rows.length === 0) return unauthorized(res, 'Credenciales invalidas');
    const user = rows[0];

    if (user.status !== 'activo') {
      return unauthorized(res, 'Usuario inactivo. Contacta al administrador.');
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) return unauthorized(res, 'Credenciales invalidas');

    const token = signToken({ id: user.id, role: user.role, name: user.full_name });

    return ok(res, {
      token,
      user: { id: user.id, name: user.full_name, email: user.email, role: user.role },
    }, 'Login exitoso');
  } catch (err) {
    console.error(err);
    return serverError(res);
  }
};

const seedPasswords = async (req, res) => {
  try {
    const newHash = await hashPassword('password123');
    await pool.query('UPDATE users SET password = ?', [newHash]);
    return ok(res, {}, 'Contrasenas demo actualizadas a "password123"');
  } catch (err) {
    console.error(err);
    return serverError(res);
  }
};

const me = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, r.name AS role, u.status
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE u.id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return unauthorized(res, 'Usuario no encontrado');
    return ok(res, rows[0]);
  } catch (err) {
    return serverError(res);
  }
};

module.exports = { login, seedPasswords, me };
