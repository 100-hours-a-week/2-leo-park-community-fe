// /backend/controllers/userController.js

import bcrypt from 'bcrypt';
import pool from '../database/db.js';
import { saveBase64Image } from '../utils/base64Encoding.js';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';

// UUID와 BINARY 변환 함수
function uuidToBuffer(uuid) {
  return Buffer.from(uuid.replace(/-/g, ''), 'hex');
}

function bufferToUuid(buffer) {
  const hex = buffer.toString('hex');
  return [
    hex.substr(0, 8),
    hex.substr(8, 4),
    hex.substr(12, 4),
    hex.substr(16, 4),
    hex.substr(20, 12),
  ].join('-');
}

// 로그인
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await pool.query(sql, [email]);

    if (rows.length === 0) {
      return res.status(401).json({
        error: true,
        errorField: 'email',
        message: '등록되지 않은 이메일입니다.',
      });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({
        error: true,
        errorField: 'password',
        message: '비밀번호가 일치하지 않습니다.',
      });
    }

    // 세션에 사용자 정보 저장
    req.session.user = {
      id: bufferToUuid(user.id),
      email: user.email,
      nickname: user.nickname,
      profileImage: user.profileImage,
    };

    res.status(200).json({
      error: false,
      message: '로그인에 성공했습니다.',
    });
  } catch (error) {
    console.error('로그인 중 오류 발생:', error);
    res.status(500).json({
      error: true,
      message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    });
  }
};

// 사용자 프로필 조회
export const getUserProfile = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      error: true,
      message: '로그인이 필요합니다.',
    });
  }

  res.status(200).json(req.session.user);
};

// 로그아웃
export const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('세션 삭제 중 오류 발생:', err);
      return res.status(500).json({
        error: true,
        message: '로그아웃 중 오류가 발생했습니다.',
      });
    }

    res.clearCookie('connect.sid');
    res.status(200).json({
      error: false,
      message: '로그아웃되었습니다.',
    });
  });
};

// 회원가입
export const register = async (req, res) => {
  const { email, password, nickname, profileImage } = req.body;

  try {
    // 입력값 검증
    if (!email) {
      return res
        .status(400)
        .json({ errorField: 'email', message: '이메일을 입력해주세요.' });
    }

    if (!password) {
      return res.status(400).json({
        errorField: 'password',
        message: '비밀번호를 입력해주세요.',
      });
    }

    if (!nickname) {
      return res.status(400).json({
        errorField: 'nickname',
        message: '닉네임을 입력해주세요.',
      });
    }

    // 이메일 형식 확인
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return res.status(400).json({
        errorField: 'email',
        message: '올바른 이메일 형식을 입력해주세요.',
      });
    }

    // 비밀번호 유효성 검사
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/.test(
        password,
      )
    ) {
      return res.status(400).json({
        errorField: 'password',
        message:
          '비밀번호는 8~20자, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.',
      });
    }

    // 닉네임 길이 및 공백 확인
    if (nickname.length > 10) {
      return res.status(400).json({
        errorField: 'nickname',
        message: '닉네임은 최대 10자까지 가능합니다.',
      });
    }

    if (/\s/.test(nickname)) {
      return res.status(400).json({
        errorField: 'nickname',
        message: '닉네임에 공백을 사용할 수 없습니다.',
      });
    }

    // 중복된 이메일 및 닉네임 확인
    let sql = 'SELECT * FROM users WHERE email = ?';
    let [rows] = await pool.query(sql, [email]);

    if (rows.length > 0) {
      return res.status(409).json({
        errorField: 'email',
        message: '이미 등록된 이메일입니다.',
      });
    }

    sql = 'SELECT * FROM users WHERE nickname = ?';
    [rows] = await pool.query(sql, [nickname]);

    if (rows.length > 0) {
      return res.status(409).json({
        errorField: 'nickname',
        message: '이미 사용 중인 닉네임입니다.',
      });
    }

    // 비밀번호 해싱
    const passwordHash = await bcrypt.hash(password, 10);

    // UUID 생성
    const id = uuidToBuffer(uuidv4());

    // 프로필 이미지 저장
    let profileImageUrl = '/public/images/default-profile.png';

    if (profileImage) {
      try {
        const filename = `profile_${Date.now()}.png`;
        profileImageUrl = saveBase64Image(profileImage, filename);
      } catch (error) {
        console.error('프로필 이미지 저장 중 오류 발생:', error);
        return res.status(500).json({ error: '프로필 이미지 저장 중 오류가 발생했습니다.' });
      }
    }

    // 사용자 저장
    sql = 'INSERT INTO users (id, email, passwordHash, nickname, profileImage) VALUES (?, ?, ?, ?, ?)';
    await pool.query(sql, [id, email, passwordHash, nickname, profileImageUrl]);

    res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      email,
      nickname,
      profileImage: profileImageUrl,
    });
  } catch (error) {
    console.error('회원가입 중 오류 발생:', error);
    res.status(500).json({ message: '회원가입 중 오류가 발생했습니다.' });
  }
};

// 계정 삭제
export const deleteUser = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  const userId = req.session.user.id;

  try {
    // 사용자 삭제
    let sql = 'DELETE FROM users WHERE id = ?';
    await pool.query(sql, [uuidToBuffer(userId)]);

    // TODO: 사용자의 게시글 및 댓글 삭제 (필요하다면 추가 구현)

    // 세션 삭제
    req.session.destroy(err => {
      if (err) {
        console.error('세션 삭제 중 오류 발생:', err);
        return res.status(500).json({
          message: '계정 삭제 중 오류가 발생했습니다.',
        });
      }

      res.clearCookie('connect.sid');
      res.status(200).json({ message: '계정이 삭제되었습니다.' });
    });
  } catch (error) {
    console.error('계정 삭제 중 오류 발생:', error);
    res.status(500).json({ message: '계정 삭제 중 오류가 발생했습니다.' });
  }
};

// 계정 정보 수정
export const updateAccount = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  const userId = req.session.user.id;
  const { newNickname, profileImage } = req.body;

  try {
    // 사용자 조회
    let sql = 'SELECT * FROM users WHERE id = ?';
    let [rows] = await pool.query(sql, [uuidToBuffer(userId)]);

    if (rows.length === 0) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    const user = rows[0];

    const updates = [];
    const values = [];

    // 닉네임 업데이트
    if (newNickname) {
      if (newNickname.length > 10 || /\s/.test(newNickname)) {
        return res.status(400).json({
          error: '닉네임은 10자 이내여야 하며, 공백이 포함될 수 없습니다.',
        });
      }

      // 닉네임 중복 확인
      sql = 'SELECT * FROM users WHERE nickname = ? AND id != ?';
      [rows] = await pool.query(sql, [newNickname, uuidToBuffer(userId)]);
      if (rows.length > 0) {
        return res.status(409).json({
          error: '이미 사용 중인 닉네임입니다.',
        });
      }

      updates.push('nickname = ?');
      values.push(newNickname);
      req.session.user.nickname = newNickname;
    }

    // 프로필 이미지 업데이트
    if (profileImage) {
      try {
        const filename = `profile_${user.email}_${Date.now()}.png`;
        const imageUrl = saveBase64Image(profileImage, filename);
        updates.push('profileImage = ?');
        values.push(imageUrl);
        req.session.user.profileImage = imageUrl;
      } catch (error) {
        console.error('프로필 이미지 저장 중 오류 발생:', error);
        return res.status(500).json({ error: '프로필 이미지 저장 중 오류가 발생했습니다.' });
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: '변경할 내용이 없습니다.' });
    }

    values.push(uuidToBuffer(userId));
    sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await pool.query(sql, values);

    res.status(200).json({
      message: '계정 정보가 성공적으로 변경되었습니다.',
      updatedNickname: req.session.user.nickname,
      updatedProfileImage: req.session.user.profileImage,
    });
  } catch (error) {
    console.error('계정 정보 변경 중 오류 발생:', error);
    res.status(500).json({ error: '계정 정보 변경 중 오류가 발생했습니다.' });
  }
};

// 비밀번호 변경
export const updatePassword = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  const userId = req.session.user.id;
  const { newPassword } = req.body;

  try {
    // 사용자 조회
    let sql = 'SELECT * FROM users WHERE id = ?';
    let [rows] = await pool.query(sql, [uuidToBuffer(userId)]);

    if (rows.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const user = rows[0];

    // 새 비밀번호 유효성 검사
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/.test(
        newPassword,
      )
    ) {
      return res.status(400).json({
        message:
          '새 비밀번호는 8~20자, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.',
      });
    }

    // 새 비밀번호와 기존 비밀번호 비교
    const newPasswordMatch = await bcrypt.compare(
      newPassword,
      user.passwordHash,
    );

    if (newPasswordMatch) {
      return res.status(400).json({
        message: '새 비밀번호는 기존 비밀번호와 다르게 설정해야 합니다.',
      });
    }

    // 비밀번호 업데이트
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    sql = 'UPDATE users SET passwordHash = ? WHERE id = ?';
    await pool.query(sql, [hashedPassword, uuidToBuffer(userId)]);

    // 세션 무효화 및 로그아웃 처리
    req.session.destroy(err => {
      if (err) {
        console.error('세션 삭제 중 오류 발생:', err);
        return res.status(500).json({
          message: '비밀번호 변경 중 오류가 발생했습니다.',
        });
      }

      res.clearCookie('connect.sid');
      res.status(200).json({
        message: '비밀번호가 성공적으로 변경되었습니다.',
      });
    });
  } catch (error) {
    console.error('비밀번호 변경 중 오류 발생:', error);
    res.status(500).json({ message: '비밀번호 변경 중 오류가 발생했습니다.' });
  }
};