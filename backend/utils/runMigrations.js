// backend/utils/runMigrations.js

import pool from '../database/db.js';

const tableExists = async (tableName) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`,
    [tableName],
  );
  return rows[0].count > 0;
};

const runMigrations = async () => {
  if (await tableExists('posts')) {
    console.log('Tables already exist. Skipping migrations...');
    return;
  }

  // 테이블 생성 마이그레이션 실행
  await pool.query(`
    CREATE TABLE posts (
      id BINARY(16) PRIMARY KEY,
      title VARCHAR(255),
      content TEXT,
      authorId BINARY(16),
      date TIMESTAMP,
      likes INT DEFAULT 0,
      views INT DEFAULT 0
    );
  `);
  console.log('Migrations completed.');
};