// /backend/models/User.js

import pool from '../database/db.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { uuidToBuffer, bufferToUuid } from '../utils/uuidUtils.js';


const User = {
  createUser: async ({ email, password, nickname, profileImage }) => {
    const id = uuidToBuffer(uuidv4());
    const passwordHash = await bcrypt.hash(password, 10);

    const sql =
      'INSERT INTO users (id, email, passwordHash, nickname, profileImage) VALUES (?, ?, ?, ?, ?)';
    await pool.query(sql, [id, email, passwordHash, nickname, profileImage]);

    return { id: bufferToUuid(id), email, nickname, profileImage };
  },

  getUserByEmail: async (email) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await pool.query(sql, [email]);

    if (rows.length === 0) return null;

    const user = rows[0];
    user.id = bufferToUuid(user.id);
    return user;
  },

  getUserById: async (id) => {
    const idBuffer = uuidToBuffer(id);
    const sql = 'SELECT * FROM users WHERE id = ?';
    const [rows] = await pool.query(sql, [idBuffer]);

    if (rows.length === 0) return null;

    const user = rows[0];
    user.id = bufferToUuid(user.id);
    return user;
  },

  updateUser: async (id, data) => {
    const idBuffer = uuidToBuffer(id);
    const fields = [];
    const values = [];

    if (data.nickname) {
      fields.push('nickname = ?');
      values.push(data.nickname);
    }
    if (data.profileImage) {
      fields.push('profileImage = ?');
      values.push(data.profileImage);
    }
    if (fields.length === 0) return;

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    values.push(idBuffer);

    await pool.query(sql, values);
  },

  deleteUser: async (id) => {
    const idBuffer = uuidToBuffer(id);
    const sql = 'DELETE FROM users WHERE id = ?';
    await pool.query(sql, [idBuffer]);
  },

  verifyPassword: async (email, password) => {
    const user = await User.getUserByEmail(email);
    if (!user) return null;

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) return null;

    return user;
  },
};

export default User;