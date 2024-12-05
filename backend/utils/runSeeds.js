// backend/utils/runSeeds.js

import pool from '../database/db.js';

const seedData = async () => {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (rows[0].count > 0) {
      console.log('Seed data already exists. Skipping...');
      return;
    }
  
    // Seed 데이터 삽입
    await pool.query(`
      INSERT INTO users (id, email, nickname, passwordHash)
      VALUES
      (UNHEX('123e4567e89b12d3a456426614174000'), 'test@example.com', 'Test User', 'hashed_password');
    `);
  
    console.log('Seed data inserted.');
  };