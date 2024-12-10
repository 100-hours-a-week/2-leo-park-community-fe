// /backend/models/Post.js

import pool from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';
import { uuidToBuffer, bufferToUuid } from '../utils/uuidUtils.js';
import { formatDate } from '../utils/dateFormatter.js';

const Post = {
    // 모든 게시글 목록 조회
    getAllPosts: async () => {
        const [rows] = await pool.query(`
            SELECT posts.*, users.nickname AS author
            FROM posts
            JOIN users ON posts.user_id = users.id
            WHERE posts.deleted_at IS NULL
            ORDER BY posts.created_at DESC
        `);
        return rows.map(post => ({
            ...post,
            id: bufferToUuid(post.id),
            author: post.author,
        }));
    },

    // 특정 게시글 상세 조회
    getPostById: async (id) => {
        const idBuffer = uuidToBuffer(id);
        const [rows] = await pool.query(
            `
            SELECT posts.*, users.nickname AS author
            FROM posts
            JOIN users ON posts.user_id = users.id
            WHERE posts.id = ? AND posts.deleted_at IS NULL
            `,
            [idBuffer],
        );

        if (rows.length === 0) return null;

        const post = rows[0];
        post.id = bufferToUuid(post.id);
        post.user_id = bufferToUuid(post.user_id);
        return post;
    },

    // 게시글 생성
    createPost: async ({ title, content, image, user_id }) => {
        const id = uuidToBuffer(uuidv4());
        const userIdBuffer = uuidToBuffer(user_id);
        // DB에서 created_at, updated_at 기본값 처리 가능하므로 직접 설정 불필요
        // 필요 시 formatDate()로 설정 가능

        await pool.query(
            'INSERT INTO posts (id, title, content, image, user_id, likes, views, comment_count) VALUES (?, ?, ?, ?, ?, 0, 0, 0)',
            [id, title, content, image, userIdBuffer],
        );

        return {
            id: bufferToUuid(id),
            title,
            content,
            image,
            user_id,
            likes: 0,
            views: 0,
            comment_count: 0,
        };
    },

    // 게시글 수정
    updatePost: async (id, data) => {
        const idBuffer = uuidToBuffer(id);
        const fields = [];
        const values = [];

        if (data.title) {
            fields.push('title = ?');
            values.push(data.title);
        }
        if (data.content) {
            fields.push('content = ?');
            values.push(data.content);
        }
        if (data.image !== undefined) {
            fields.push('image = ?');
            values.push(data.image);
        }
        if (fields.length === 0) return;

        // updated_at은 ON UPDATE CURRENT_TIMESTAMP로 자동 변경되지만
        // 필요하다면 수동 업데이트 가능
        // fields.push('updated_at = ?');
        // values.push(formatDate());

        const sql = `UPDATE posts SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`;
        values.push(idBuffer);

        await pool.query(sql, values);
    },

    // 게시글 삭제 (논리 삭제)
    deletePost: async (id) => {
        const idBuffer = uuidToBuffer(id);
        const sql = 'UPDATE posts SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL';
        await pool.query(sql, [formatDate(), idBuffer]);
    },

    // 게시글 작성자 확인
    getPostAuthorById: async (id) => {
        const idBuffer = uuidToBuffer(id);
        const [rows] = await pool.query('SELECT user_id FROM posts WHERE id = ? AND deleted_at IS NULL', [idBuffer]);
        if (rows.length === 0) return null;
        return bufferToUuid(rows[0].user_id);
    },

    // 게시글 조회수 증가
    incrementPostViews: async (id) => {
        const idBuffer = uuidToBuffer(id);
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 조회수 증가 (논리 삭제된 게시글에는 영향 없음)
            await connection.query('UPDATE posts SET views = views + 1 WHERE id = ? AND deleted_at IS NULL', [idBuffer]);

            const [rows] = await connection.query('SELECT views FROM posts WHERE id = ?', [idBuffer]);

            await connection.commit();
            return rows[0].views;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // 게시글 좋아요 증가
    incrementPostLikes: async (id) => {
        const idBuffer = uuidToBuffer(id);
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            await connection.query('UPDATE posts SET likes = likes + 1 WHERE id = ? AND deleted_at IS NULL', [idBuffer]);

            const [rows] = await connection.query('SELECT likes FROM posts WHERE id = ?', [idBuffer]);

            await connection.commit();
            return rows[0].likes;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },
};

export default Post;