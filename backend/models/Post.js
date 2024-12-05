// /backend/models/Post.js

import pool from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';
import { uuidToBuffer, bufferToUuid } from '../utils/uuidUtils.js';

const Post = {
  // 모든 게시글 목록 조회
  getAllPosts: async () => {
    const [rows] = await pool.query('SELECT * FROM posts ORDER BY date DESC');
    return rows.map(post => ({
      ...post,
      id: bufferToUuid(post.id),
    }));
  },

  // 특정 게시글 상세 조회
  getPostById: async (id) => {
    const idBuffer = uuidToBuffer(id);
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [idBuffer]);

    if (rows.length === 0) return null;

    const post = rows[0];
    post.id = bufferToUuid(post.id);
    return post;
  },

  // 게시글 생성
  createPost: async ({ title, content, image, authorId, date, likes = 0, views = 0 }) => {
    const id = uuidToBuffer(uuidv4());
    const [result] = await pool.query(
      'INSERT INTO posts (id, title, content, image, author_id, date, likes, views) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, content, image, authorId, date, likes, views],
    );

    return {
      id: bufferToUuid(id),
      title,
      content,
      image,
      authorId,
      date,
      likes,
      views,
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
    if (data.image) {
      fields.push('image = ?');
      values.push(data.image);
    }
    if (fields.length === 0) return;

    const sql = `UPDATE posts SET ${fields.join(', ')} WHERE id = ?`;
    values.push(idBuffer);

    await pool.query(sql, values);
  },

  // 게시글 삭제
  deletePost: async (id) => {
    const idBuffer = uuidToBuffer(id);
    const sql = 'DELETE FROM posts WHERE id = ?';
    await pool.query(sql, [idBuffer]);
  },
};

export default Post;