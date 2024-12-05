// /backend/models/Comment.js

import pool from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';
import { formatDate } from '../utils/dateFormatter.js';
import { uuidToBuffer, bufferToUuid } from '../utils/uuidUtils.js';


// Comment 모델
const Comment = {
    // 게시글 ID로 댓글 조회
    getCommentsByPostId: async (postId) => {
        const [rows] = await pool.query(
            'SELECT id, content, author, date FROM comments WHERE postId = ? ORDER BY date ASC',
            [uuidToBuffer(postId)],
        );

        // BINARY -> UUID 변환
        return rows.map((row) => ({
            ...row,
            id: bufferToUuid(row.id),
        }));
    },

    // 댓글 생성
    addComment: async ({ content, author, postId }) => {
        const connection = await pool.getConnection(); // 연결 객체 가져오기
        try {
            await connection.beginTransaction(); // 트랜잭션 시작
    
            // 댓글 삽입
            const id = uuidToBuffer(uuidv4());
            const date = formatDate();
            await connection.query(
                'INSERT INTO comments (id, content, author, postId, date) VALUES (?, ?, ?, ?, ?)',
                [id, content, author, uuidToBuffer(postId), date]
            );
    
            // comments_count 증가
            await connection.query(
                'UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?',
                [uuidToBuffer(postId)]
            );
    
            await connection.commit(); // 트랜잭션 커밋
            return { id: bufferToUuid(id), content, author, postId, date };
        } catch (error) {
            await connection.rollback(); // 트랜잭션 롤백
            console.error('댓글 작성 중 오류:', error);
            throw error;
        } finally {
            connection.release(); // 연결 반환
        }
    },


    // 댓글 삭제
    deleteComment: async (commentId) => {
        const idBuffer = uuidToBuffer(commentId);

        await pool.query('DELETE FROM comments WHERE id = ?', [idBuffer]);

        return { id: commentId };
    },


    // 댓글 수정
    updateComment: async (commentId, content) => {
        const idBuffer = uuidToBuffer(commentId);

        await pool.query(
            'UPDATE comments SET content = ? WHERE id = ?',
            [content, idBuffer],
        );

        return {
            id: commentId,
            content,
        };
    },



    // 특정 댓글 조회
    getCommentById: async (commentId) => {
        const idBuffer = uuidToBuffer(commentId);

        const [rows] = await pool.query(
            'SELECT id, content, author, postId, date FROM comments WHERE id = ?',
            [idBuffer],
        );

        if (rows.length === 0) return null;

        const comment = rows[0];
        return {
            ...comment,
            id: bufferToUuid(comment.id),
            postId: bufferToUuid(comment.postId),
        };
    },
};

export default Comment;