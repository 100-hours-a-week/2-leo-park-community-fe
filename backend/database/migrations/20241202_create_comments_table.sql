-- backend/database/migrations/20241202_create_comments_table.sql

CREATE TABLE IF NOT EXISTS comments (
    id BINARY(16) PRIMARY KEY,
    content TEXT NOT NULL,
    author VARCHAR(50) NOT NULL, -- users.nickname
    authorId BINARY(16) NOT NULL, -- users.id
    postId BINARY(16) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
    FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE
);