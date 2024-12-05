// /backend/controllers/postController.js

import pool from '../database/db.js';
import { saveBase64Image } from '../utils/base64Encoding.js';
import { formatDate } from '../utils/dateFormatter.js';

import Post from '../models/Post.js';
import Comment from '../models/Comment.js';


// 모든 게시글 목록 조회
export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.getAllPosts();
        res.json(posts);
    } catch (error) {
        console.error('게시글 목록 조회 중 오류 발생:', error);
        res.status(500).json({ message: '게시글 조회 중 오류가 발생했습니다.' });
    }
};

// 특정 게시글 상세 조회
export const getPostById = async (req, res) => {
    const { id } = req.params;

    try {
        const post = await Post.getPostById();
        if (!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        const comments = await Comment.getCommentsByPostId(id);
        res.json({
            ...post,
            comments,
        });
    } catch (error) {
        console.error('게시글 조회 중 오류 발생:', error);
        res.status(500).json({ message: '게시글 조회 중 오류가 발생했습니다.' });
    }
};

// 게시글 생성
export const createPost = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const { title, content, image } = req.body;
    const author = req.session.user.nickname;
    const authorId = req.session.user.id;

    // 유효성 검사
    if (!title || !content) {
        return res.status(400).json({ message: '제목과 내용을 입력해주세요.' });
    }

    if (title.length > 26) {
        return res.status(400).json({ message: '제목은 최대 26자까지 가능합니다.' });
    }

    try {
        // 이미지 저장
        let imageUrl = null;
        if (image) {
            const filename = `post_${Date.now()}.png`;
            imageUrl = saveBase64Image(image, filename);
        }

        const date = formatDate();

        const newPost = await Post.createPost({
            title,
            content,
            image: imageUrl,
            authorId,
            date,
            likes,
            views,
        });

        res.status(201).json({
            message: '게시글이 성공적으로 등록되었습니다.',
            post: newPost,
        });
    } catch (error) {
        console.error('게시글 생성 중 오류 발생:', error);
        res.status(500).json({ message: '게시글 생성 중 오류가 발생했습니다.' });
    }
};

// 게시글 수정
export const updatePost = async (req, res) => {
    const { id } = req.params;

    if (!req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const { title, content, image } = req.body;
    const userNickname = req.session.user.nickname;

    try {
        // 게시글 조회
        let sql = 'SELECT * FROM posts WHERE id = ?';
        let [rows] = await pool.query(sql, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        const post = rows[0];

        // 작성자 확인
        if (post.author !== userNickname) {
            return res.status(403).json({ message: '게시글 수정 권한이 없습니다.' });
        }

        // 유효성 검사
        if (!title || !content) {
            return res.status(400).json({ message: '제목과 내용은 필수입니다.' });
        }

        // 이미지 저장
        let imageUrl = post.image;
        if (image) {
            const filename = `post_${id}_${Date.now()}.png`;
            imageUrl = saveBase64Image(image, filename);
        }

        // 게시글 업데이트
        sql = 'UPDATE posts SET title = ?, content = ?, image = ?, date = ? WHERE id = ?';
        await pool.query(sql, [title, content, imageUrl, new Date(), id]);

        res.json({ message: '게시글이 수정되었습니다.' });
    } catch (error) {
        console.error('게시글 수정 중 오류 발생:', error);
        res.status(500).json({ message: '게시글 수정 중 오류가 발생했습니다.' });
    }
};

// 게시글 삭제
export const deletePost = async (req, res) => {
    const { id } = req.params;

    if (!req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const userNickname = req.session.user.nickname;

    try {
        // 게시글 조회
        let sql = 'SELECT * FROM posts WHERE id = ?';
        let [rows] = await pool.query(sql, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        const post = rows[0];

        // 작성자 확인
        if (post.author !== userNickname) {
            return res.status(403).json({ message: '게시글 삭제 권한이 없습니다.' });
        }

        // 게시글 삭제
        sql = 'DELETE FROM posts WHERE id = ?';
        await pool.query(sql, [id]);

        res.json({ message: '게시글이 삭제되었습니다.' });
    } catch (error) {
        console.error('게시글 삭제 중 오류 발생:', error);
        res.status(500).json({ message: '게시글 삭제 중 오류가 발생했습니다.' });
    }
};

// 게시글 조회수 증가
export const incrementPostViews = async (req, res) => {
    const { id } = req.params;

    try {
        const sql = 'UPDATE posts SET views = views + 1 WHERE id = ?';
        await pool.query(sql, [id]);

        const [rows] = await pool.query('SELECT views FROM posts WHERE id = ?', [id]);
        const views = rows[0].views;

        res.json({ views });
    } catch (error) {
        console.error('조회수 증가 중 오류 발생:', error);
        res.status(500).json({ message: '조회수 증가 중 오류가 발생했습니다.' });
    }
};

// 게시글 좋아요 증가
export const incrementPostLikes = async (req, res) => {
    const { id } = req.params;

    try {
        const sql = 'UPDATE posts SET likes = likes + 1 WHERE id = ?';
        await pool.query(sql, [id]);

        const [rows] = await pool.query('SELECT likes FROM posts WHERE id = ?', [id]);
        const likes = rows[0].likes;

        res.json({ likes });
    } catch (error) {
        console.error('좋아요 증가 중 오류 발생:', error);
        res.status(500).json({ message: '좋아요 증가 중 오류가 발생했습니다.' });
    }
};

// 댓글 추가
export const addComment = async (req, res) => {
    const { id } = req.params; // 게시글 ID
    const { content } = req.body;

    if (!req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const author = req.session.user.nickname;

    if (!content || content.trim() === '') {
        return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
    }

    try {
        // 댓글 추가
        const date = formatDate();
        const sql = 'INSERT INTO comments (postId, author, content, date) VALUES (?, ?, ?, ?)';
        await pool.query(sql, [id, author, content, date]);

        res.status(201).json({ message: '댓글이 추가되었습니다.' });
    } catch (error) {
        console.error('댓글 추가 중 오류 발생:', error);
        res.status(500).json({ message: '댓글 추가 중 오류가 발생했습니다.' });
    }
};

// 댓글 삭제
export const deleteComment = async (req, res) => {
    const { postId, commentId } = req.params;

    if (!req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const userNickname = req.session.user.nickname;

    try {
        // 댓글 조회
        let sql = 'SELECT * FROM comments WHERE id = ? AND postId = ?';
        let [rows] = await pool.query(sql, [commentId, postId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
        }

        const comment = rows[0];

        // 작성자 확인
        if (comment.author !== userNickname) {
            return res.status(403).json({ message: '댓글 삭제 권한이 없습니다.' });
        }

        // 댓글 삭제
        await Comment.deleteComment(commentId);

        res.json({ message: '댓글이 삭제되었습니다.' });
    } catch (error) {
        console.error('댓글 삭제 중 오류 발생:', error);
        res.status(500).json({ message: '댓글 삭제 중 오류가 발생했습니다.' });
    }
};

// 댓글 수정
export const updateComment = async (req, res) => {
    const { postId, commentId } = req.params;
    const { content } = req.body;

    if (!req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const userNickname = req.session.user.nickname;

    if (!content || content.trim() === '') {
        return res.status(400).json({ message: '댓글 내용은 필수입니다.' });
    }

    try {
        // 댓글 조회
        let sql = 'SELECT * FROM comments WHERE id = ? AND postId = ?';
        let [rows] = await pool.query(sql, [commentId, postId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
        }

        const comment = rows[0];

        // 작성자 확인
        if (comment.author !== userNickname) {
            return res.status(403).json({ message: '댓글 수정 권한이 없습니다.' });
        }

        // 댓글 수정
        sql = 'UPDATE comments SET content = ? WHERE id = ?';
        await pool.query(sql, [content, commentId]);

        res.json({ message: '댓글이 수정되었습니다.' });
    } catch (error) {
        console.error('댓글 수정 중 오류 발생:', error);
        res.status(500).json({ message: '댓글 수정 중 오류가 발생했습니다.' });
    }
};