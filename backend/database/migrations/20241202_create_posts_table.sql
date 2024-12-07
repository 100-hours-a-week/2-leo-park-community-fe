-- backend/database/migrations/20241202_create_posts_table.sql

CREATE TABLE IF NOT EXISTS posts (
    id BINARY(16) PRIMARY KEY CONSTRAINT pk_posts_id,
    title VARCHAR(255) NOT NULL CHECK (LENGTH(title) <= 255),
    content TEXT NOT NULL CHECK (LENGTH(content) > 0),
    image VARCHAR(255),
    user_id BINARY(16) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    likes INT DEFAULT 0,
    views INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_id ON posts(user_id);
