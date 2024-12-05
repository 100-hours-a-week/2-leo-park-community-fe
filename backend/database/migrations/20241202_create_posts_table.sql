-- backend/database/migrations/20241202_create_posts_table.sql

CREATE TABLE IF NOT EXISTS posts (
    id BINARY(16) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image VARCHAR(255),
    author VARCHAR(50) NOT NULL, -- users.nickname
    authorId BINARY(16) NOT NULL, -- user.id
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    likes INT DEFAULT 0,
    views INT DEFAULT 0,
    comments_count INT DEFAULT 0
    FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE
);

-- TRIGGER
