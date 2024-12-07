-- backend/database/migrations/20241202_create_users_table.sql

CREATE TABLE IF NOT EXISTS users (
  id BINARY(16) PRIMARY KEY,
  email VARCHAR(255) NOT NULL CONSTRAINT unique_email UNIQUE CHECK (email LIKE '%@%.%'),
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) NOT NULL CONSTRAINT unique_nickname UNIQUE CHECK (LENGTH(nickname) > 1),
  profile_image VARCHAR(255) DEFAULT '/public/images/default-profile.png',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL
);