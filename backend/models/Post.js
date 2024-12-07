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
        ORDER BY posts.date DESC
      `);
        return rows.map(post => ({
            ...post,
            id: bufferToUuid(post.id),
            authorId: bufferToUuid(post.user_id),
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
        const createdAt = formatDate();

        await pool.query(
            'INSERT INTO posts (id, title, content, image, user_id, created_at, likes, views, comment_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, title, content, image, userIdBuffer, createdAt, 0, 0, 0],
        );

        return {
            id: bufferToUuid(id),
            title,
            content,
            image,
            user_id,
            created_at: createdAt,
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

        fields.push('updated_at = ?');
        values.push(formatDate());

        const sql = `UPDATE posts SET ${fields.join(', ')} WHERE id = ?`;
        values.push(idBuffer);

        await pool.query(sql, values);
    },


    // 게시글 삭제 (논리 삭제)
    deletePost: async (id) => {
        const idBuffer = uuidToBuffer(id);
        const sql = 'UPDATE posts SET deleted_at = ? WHERE id = ?';
        await pool.query(sql, [formatDate(), idBuffer]);
    },

    // 게시글 작성자 확인
    getPostAuthorById: async (id) => {
        const idBuffer = uuidToBuffer(id);
        const [rows] = await pool.query('SELECT user_id FROM posts WHERE id = ?', [idBuffer]);
        if (rows.length === 0) return null;
        return bufferToUuid(rows[0].user_id);
    },

    // 게시글 조회수 증가
    incrementPostViews: async (id) => {
        const idBuffer = uuidToBuffer(id);
        const connection = await pool.getConnection(); // connection 생성
        try {
            await connection.beginTransaction(); // 트랜잭션 시작

            // 조회수 증가
            await connection.query('UPDATE posts SET views = views + 1 WHERE id = ?', [idBuffer]);

            // 조회수 반환
            const [rows] = await connection.query('SELECT views FROM posts WHERE id = ?', [idBuffer]);

            await connection.commit(); // 트랜잭션 커밋
            return rows[0].views;
        } catch (error) {
            await connection.rollback(); // 에러 발생 시 롤백
            throw error;
        } finally {
            connection.release(); // 연결 해제
        }
    },

    // 게시글 좋아요 증가
    incrementPostLikes: async (id) => {
        const idBuffer = uuidToBuffer(id);
        const connection = await pool.getConnection(); // connection 생성
        try {
            await connection.beginTransaction(); // 트랜잭션 시작

            // 좋아요 증가
            await connection.query('UPDATE posts SET likes = likes + 1 WHERE id = ?', [idBuffer]);

            // 좋아요 반환
            const [rows] = await connection.query('SELECT likes FROM posts WHERE id = ?', [idBuffer]);

            await connection.commit(); // 트랜잭션 커밋
            return rows[0].likes;
        } catch (error) {
            await connection.rollback(); // 에러 발생 시 롤백
            throw error;
        } finally {
            connection.release(); // 연결 해제
        }
    },
};

export default Post;