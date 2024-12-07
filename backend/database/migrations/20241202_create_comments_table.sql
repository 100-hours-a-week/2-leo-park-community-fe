-- backend/database/migrations/20241202_create_comments_table.sql

CREATE TABLE IF NOT EXISTS comments (
    id BINARY(16) PRIMARY KEY CONSTRAINT pk_comments_id,
    content TEXT NOT NULL CHECK (LENGTH(content) > 0),
    user_id BINARY(16) NOT NULL,
    post_id BINARY(16) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_post_id ON comments(post_id);
CREATE INDEX idx_user_id ON comments(user_id);