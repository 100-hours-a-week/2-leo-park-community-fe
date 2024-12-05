// /backend/routes/api.js

import express from 'express';
import bcrypt from 'bcrypt';

// NOTE: 게시글 및 댓글 수정/삭제 엔드포인트에서 작성자 확인을 위한 유틸 함수
import { isAuthor } from '../utils/authorization.js';
// NOTE: 게시글 이미지를 추가하고 수정할 때, json body에 게시글 제목하고 내용과 함께 담아 한번에 보내고 싶어서 base64로 인코딩함
import { saveBase64Image } from '../utils/base64Encoding.js';
// NOTE: 쿠키, 세션을 활용한 인증/인가 구현을 위한 세션 미들웨어
import { sessionMiddleware } from '../utils/sessionMiddleware.js';

import * as userController from '../controllers/userController.js';
import * as postController from '../controllers/postController.js';

const router = express.Router();

// 세션 미들웨어 등록
router.use(sessionMiddleware);

// ============ About users routes ============ //

// 로그인
router.post('/login', userController.login);

// 로그인된 사용자 정보 조회
router.get('/user/profile', userController.getUserProfile);

// 로그아웃
router.post('/logout', userController.logout);

// 회원가입
router.post('/register', userController.register);

// 계정 삭제
router.delete('/users/delete', userController.deleteUser);

// 계정 정보 수정 (닉네임, 프로필 이미지 변경)
router.patch('/users/account', userController.updateAccount);

// 계정 정보 수정 (비밀번호 변경)
router.patch('/users/password', userController.updatePassword);


// ============ About posts routes ============ //

// 모든 게시글 목록 조회
router.get('/posts', postController.getPosts);

// 특정 게시글 상세 조회
router.get('/posts/:id', postController.getPostById);

// 게시글 생성
router.post('/posts', postController.createPost);

// 게시글 수정
router.put('/posts/:id', postController.updatePost);

// 게시글 삭제
router.delete('/posts/:id', postController.deletePost);

// 게시글 조회수 증가
router.post('/posts/:id/views', postController.incrementPostViews);

// 게시글 좋아요 증가
router.post('/posts/:id/likes', postController.incrementPostLikes);

// 댓글 추가
router.post('/posts/:id/comments', postController.addComment);

// 댓글 삭제
router.delete('/posts/:postId/comments/:commentId', postController.deleteComment);

// 댓글 수정
router.put('/posts/:postId/comments/:commentId', postController.updateComment);


export default router;



/*
// HACK: 임시로 사용자 확인 로직을 위한 테스트용 users 더미 데이터 추가
const users = [
    {
        email: 'test@example.com',
        passwordHash: bcrypt.hashSync('Test1234!', 10), // 해시된 상태로 저장되어야 passwordMatch에서 오류 안남
        nickname: '테스트 사용자',
        profileImage: '/public/images/default-profile.png',
    },
    {
        email: 'admin@example.com',
        passwordHash: bcrypt.hashSync('Admin1234!', 10),
        nickname: '관리자',
        profileImage: '/public/images/default-profile.png',
    },
];

// HACK: 임시로 게시글 관련 로직을 위한 테스트용 posts 더미 데이터 추가
const posts = [
    {
        id: 2,
        title: '첫 번째 게시글',
        content: '이것은 첫 번째 게시글의 내용입니다.',
        author: '작성자1',
        date: '2024-05-05 12:00:00',
        likes: 10,
        comments: [
            {
                id: 1,
                author: '댓글작성자1',
                content: '첫 번째 댓글입니다.',
                date: '2024-01-01 13:30:00',
            },
            {
                id: 2,
                author: '댓글작성자2',
                content: '두 번째 댓글입니다.',
                date: '2024-01-02 15:30:00',
            },
        ],
        views: 50,
        image: '/public/images/post_3_1732105837847.png',
    },
    {
        id: 1,
        title: '두 번째 게시글',
        content: '이것은 두 번째 게시글의 내용입니다.',
        author: '작성자2',
        date: '2024-02-01 18:00:00',
        likes: 5,
        comments: [
            {
                id: 1,
                author: '댓글작성자1',
                content: '첫 번째 댓글입니다.',
                date: '2024-02-01 17:45:00',
            },
        ],
        views: 30,
        image: '/public/images/KTB_zoom_yellow.jpg',
    },
];


// ============ About users routes ============ //

// login Endpoint 
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = users.find(user => user.email === email);
        // 이메일로 사용자 검색
        if (!user) {
            return res.status(401).json({
                error: true,
                errorField: 'email',
                message: '등록되지 않은 이메일입니다.',
            });
        }
        // 사용자 비밀번호 확인
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);

        if (!passwordMatch) {
            return res.status(401).json({
                error: true,
                errorField: 'password',
                message: '비밀번호가 일치하지 않습니다.',
            });
        }

        // 로그인 성공 시에 세션에 사용자 정보 저장
        req.session.user = {
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
});

// login Success Endpoint
router.get('/user/profile', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            error: true,
            message: '로그인이 필요합니다.',
        });
    }

    res.status(200).json(req.session.user);
});

// logout Endpoint
// NOTE: req.session.destroy: 서버에서 해당 세션 데이터를 삭제
// NOTE: res.clearCookie('connect.sid'); 클라이언트 브라우저에서 세션 쿠리를 삭제
router.post('/logout', (req, res) => {
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
});

// signout Endpoint
router.delete('/users/delete', async (req, res) => {
    // 세션에서 사용자 정보 확인
    if (!req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const userEmail = req.session.user.email;

    try {
        // 1. users 배열에서 사용자 삭제
        const userIndex = users.findIndex(user => user.email === userEmail);
        if (userIndex === -1) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }
        const deletedUser = users.splice(userIndex, 1)[0]; // 삭제된 사용자 정보

        // 2. posts 배열에서 해당 사용자의 게시글 및 댓글 삭제
        posts.forEach(post => {
            // 게시글 작성자가 삭제된 사용자일 경우 게시글 삭제
            if (post.author === deletedUser.nickname) {
                posts.splice(posts.indexOf(post), 1);
            } else {
                // 댓글 작성자가 삭제된 사용자일 경우 댓글 삭제
                post.comments = post.comments.filter(
                    comment => comment.author !== deletedUser.nickname,
                );
            }
        });

        // 3. 세션 삭제 및 쿠키 제거
        req.session.destroy(err => {
            if (err) {
                console.error('세션 삭제 중 오류 발생:', err);
                return res.status(500).json({
                    message: '계정 삭제 중 오류가 발생했습니다.',
                });
            }

            res.clearCookie('connect.sid');
            // 4. 성공 응답
            res.status(200).json({ message: '계정이 삭제되었습니다.' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '계정 삭제 중 오류가 발생했습니다.' });
    }
});

// register Endpoint
router.post('/register', async (req, res) => {
    const { email, password, nickname, profileImage } = req.body;

    // 1. 필수 입력값 확인
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

    // 2. 이메일 형식 확인
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        return res.status(400).json({
            errorField: 'email',
            message: '올바른 이메일 형식을 입력해주세요.',
        });
    }

    // 3. 비밀번호 유효성 검사
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

    // 4. 닉네임 길이 및 공백 확인
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

    // 5. 중복된 이메일 및 닉네임 확인
    const userEmailCheck = users.find(u => u.email === email);
    if (userEmailCheck) {
        return res.status(409).json({
            errorField: 'email',
            message: '이미 등록된 이메일입니다.',
        });
    }

    const userNicknameCheck = users.find(u => u.nickname === nickname);
    if (userNicknameCheck) {
        return res.status(409).json({
            errorField: 'nickname',
            message: '이미 사용 중인 닉네임입니다.',
        });
    }

    // 6. 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 7. 새 사용자 저장 (임시 users 배열 사용)
    const newUser = {
        email,
        passwordHash: hashedPassword,
        nickname,
        profileImage: profileImage || '/public/images/default-profile.png',
        // 사용자가 설정한 프로필 이미지가 별도로 없을 경우에는 기본 이미지 설정
    };

    users.push(newUser); // 실제로는 데이터베이스에 저장

    // 8. 성공 응답
    return res.status(201).json({
        message: '회원가입이 완료되었습니다.',
        email: newUser.email,
        nickname: newUser.nickname,
        profileImage: newUser.profileImage,
    });
});


// nicknameEdit Endpoint
router.patch('/users/account', (req, res) => {
    // 세션에서 사용자 정보 확인
    if (!req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const userEmail = req.session.user.email;
    const { newNickname, profileImage } = req.body;

    try {
        // 1. 이메일로 사용자 검색
        const user = users.find(user => user.email === userEmail);

        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        // 2. 닉네임이 제공된 경우 유효성 검사 및 업데이트
        if (newNickname) {
            if (newNickname.length > 10 || /\s/.test(newNickname)) {
                return res.status(400).json({
                    error: '닉네임은 10자 이내여야 하며, 공백이 포함될 수 없습니다.',
                });
            }

            // 중복 닉네임 확인
            const duplicateNickname = users.some(
                user => user.nickname === newNickname && user.email !== userEmail,
            );

            if (duplicateNickname) {
                return res.status(409).json({
                    error: '이미 사용 중인 닉네임입니다.',
                });
            }

            user.nickname = newNickname;
            req.session.user.nickname = newNickname;
            // NOTE: 세션의 닉네임도 업데이트
        }

        // 3. 프로필 이미지가 제공된 경우 업데이트
        if (profileImage) {
            try {
                const filename = `profile_${user.email}_${Date.now()}.png`;
                const imageUrl = saveBase64Image(profileImage, filename);
                user.profileImage = imageUrl;
                req.session.user.profileImage = imageUrl;
                // NOTE: 세션의 프로필 이미지도 업데이트
            } catch (error) {
                console.error('프로필 이미지 저장 중 오류 발생:', error);
                return res.status(500).json({ error: '프로필 이미지 저장 중 오류가 발생했습니다.' });
            }
        }

        res.status(200).json({
            message: '계정 정보가 성공적으로 변경되었습니다.',
            updatedNickname: user.nickname,
            updatedProfileImage: user.profileImage,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '계정 정보 변경 중 오류가 발생했습니다.' });
    }
});


// passwordEdit Endpoint
router.patch('/users/password', async (req, res) => {
    // 세션에서 사용자 정보 확인
    if (!req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const userEmail = req.session.user.email;
    const { newPassword } = req.body;

    try {
        // 1. 이메일로 사용자 검색
        const user = users.find(user => user.email === userEmail);

        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        // 2. 새 비밀번호 유효성 검사
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

        // 3. 새 비밀번호와 기존 비밀번호 비교
        const newPasswordMatch = await bcrypt.compare(
            newPassword,
            user.passwordHash,
        );

        if (newPasswordMatch) {
            return res.status(400).json({
                message: '새 비밀번호는 기존 비밀번호와 다르게 설정해야 합니다.',
            });
        }

        // 4. 비밀번호 업데이트
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.passwordHash = hashedPassword;

        // 5. 세션 무효화 및 로그아웃 처리
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
        console.error(error);
        res.status(500).json({ message: '비밀번호 변경 중 오류가 발생했습니다.' });
    }
});





// ============ About posts routes ============ //

// board Endpoint
router.get('/posts', (req, res) => {
    console.log('클라이언트에서 /api/posts 관련 GET 요청이 도착했습니다.'); // debug
    res.json(posts);
});

// boardWrite Endpoint
router.post('/posts', (req, res) => {
    // 세션에서 사용자 정보 확인
    if (!req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const userNickname = req.session.user.nickname;

    const { title, content, image } = req.body;

    // 유효성 검사
    if (!title || !content) {
        return res.status(400).json({ message: '제목과 내용을 입력해주세요.' });
    }

    if (title.length > 26) {
        return res
            .status(400)
            .json({ message: '제목은 최대 26자까지 가능합니다.' });
    }

    // 새로운 게시글 생성
    const newPost = {
        id: posts.length + 1,
        title,
        content,
        image,
        author: userNickname,
        date: new Date().toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }),
        likes: 0,
        comments: [],
        views: 0,
    };

    // 이미지 처리
    if (image) {
        try {
            const filename = `post_${newPost.id}_${Date.now()}.png`; // 파일 이름 생성
            const imageUrl = saveBase64Image(image, filename);
            newPost.image = imageUrl;
        } catch (error) {
            console.error('이미지 저장 중 오류 발생:', error);
            return res
                .status(500)
                .json({ message: '이미지 저장 중 오류가 발생했습니다.' });
        }
    }

    // posts 배열에 추가
    // NOTE: 새로운 게시글이 상단에 노출되도록 하기 위해 push -> unshift로 변경
    posts.unshift(newPost);

    res.status(201).json({
        message: '게시글이 성공적으로 등록되었습니다.',
        post: newPost,
    });
});

// boardEdit Endpoint
router.put('/posts/:id', (req, res) => {
    const { id } = req.params;

    // 세션에서 사용자 정보 확인
    if (!req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const userNickname = req.session.user.nickname;

    const { title, content, image } = req.body;

    const post = posts.find(p => p.id === parseInt(id, 10));

    if (!post) {
        return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    if (!isAuthor(post.author, userNickname)) {
        return res
            .status(403)
            .json({ message: '게시글 수정 권한이 없습니다.' }); // 작성자만 수정 가능
    }

    // 유효성 검사
    if (!title || !content) {
        return res.status(400).json({ message: '제목과 내용은 필수입니다.' });
    }

    // 게시글 내용 수정
    post.title = title;
    post.content = content;

    // 게시글 수정 시간 업데이트
    post.date = new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });

    if (image) {
        try {
            // 새로운 이미지 저장
            const filename = `post_${post.id}_${Date.now()}.png`;
            const imageUrl = saveBase64Image(image, filename);
            post.image = imageUrl; // 새로운 게시글 이미지로 업데이트함
        } catch (error) {
            console.error('이미지 저장 중 오류 발생:', error);
            return res
                .status(500)
                .json({ message: '이미지 저장 중 오류가 발생했습니다.' });
        }
    }

    res.json({ message: '게시글이 수정되었습니다.', post });
});

// boardDetail & boardEdit Endpoint
router.get('/posts/:id', (req, res) => {
    const { id } = req.params;
    const post = posts.find(p => p.id === parseInt(id, 10));

    if (!post) {
        return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    res.json(post);
});

// boardDetail views Endpoint
router.post('/posts/:id/views', (req, res) => {
    const { id } = req.params;

    const post = posts.find(p => p.id === parseInt(id, 10));

    if (!post) {
        return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    post.views += 1;

    res.json({ views: post.views });
});

// boardDetail likes Endpoint
router.post('/posts/:id/likes', (req, res) => {
    const postId = parseInt(req.params.id, 10);

    // 해당 ID의 게시글 찾기
    const post = posts.find(p => p.id === postId);
    if (!post) {
        return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    // 좋아요 증가
    post.likes += 1;

    res.status(200).json({
        message: '좋아요가 추가되었습니다.',
        likes: post.likes,
    });
});

// boardDetail comments add Endpoint
router.post('/posts/:id/comments', (req, res) => {
    const { id } = req.params;
    const { content, date } = req.body;

    // 세션 사용자 확인
    if (!req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const userNickname = req.session.user.nickname;

    const post = posts.find(p => p.id === parseInt(id, 10));

    if (!post) {
        return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    const newComment = {
        id: post.comments.length + 1,
        author: userNickname, // from session/cookie
        content,
        date,
    };

    post.comments.push(newComment);

    res.status(201).json(newComment);
});

// boardDetail post delete Endpoint
router.delete('/posts/:id', (req, res) => {
    const { id } = req.params;

    // 세션 사용자 확인
    // req.session: 클라이언트가 요청 시 전송한 세션 쿠키(connect.id)를 
    // 기반으로 서버가 해당 쿠키를 사용해 저장된 세션 정보를 복원한 객체
    if (!req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const userNickname = req.session.user.nickname;

    const postIndex = posts.findIndex(p => p.id === parseInt(id, 10));

    if (postIndex === -1) {
        return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    const post = posts[postIndex];

    if (!isAuthor(post.author, userNickname)) {
        return res.status(403).json({ message: '권한이 없습니다.' }); // 작성자만 삭제 가능
    }

    posts.splice(postIndex, 1);

    res.json({ message: '게시글이 삭제되었습니다.' });
});



// // 이미지 업로드 엔드포인트(multer 모듈 사용 시에만 활성화)
// router.post('/upload', upload.single('image'), (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ message: '이미지를 업로드하지 않았습니다.' });
//     }

//     // 업로드된 이미지의 URL을 반환
//     const imageUrl = `/uploads/${req.file.filename}`;
//     res.status(200).json({ imageUrl: imageUrl });
// });

// boardDetail comments delete Endpoint
router.delete('/posts/:postId/comments/:commentId', (req, res) => {
    const { postId, commentId } = req.params;

    if (!req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const userNickname = req.session.user.nickname;

    const post = posts.find(p => p.id === parseInt(postId, 10));

    if (!post) {
        return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    const commentIndex = post.comments.findIndex(
        c => c.id === parseInt(commentId, 10),
    );

    if (commentIndex === -1) {
        return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }

    const comment = post.comments[commentIndex];

    if (!isAuthor(comment.author, userNickname)) {
        return res.status(403).json({ message: '권한이 없습니다.' }); // 작성자만 삭제 가능
    }

    post.comments.splice(commentIndex, 1);

    res.json({ message: '댓글이 삭제되었습니다.' });
});

// boardDetail comments edit Endpoint
router.put('/posts/:postId/comments/:commentId', (req, res) => {
    const postId = parseInt(req.params.postId, 10);
    const commentId = parseInt(req.params.commentId, 10);
    const { content } = req.body;

    if (!req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const userNickname = req.session.user.nickname;

    if (!content || content.trim() === '') {
        return res.status(400).json({ message: '댓글 내용은 필수입니다.' });
    }

    const post = posts.find(p => p.id === postId);
    if (!post) {
        return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    const comment = post.comments.find(c => c.id === commentId);
    if (!comment) {
        return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }

    // 작성자 확인
    if (!isAuthor(comment.author, userNickname)) {
        return res.status(403).json({ message: '댓글 수정 권한이 없습니다.' });
    }

    comment.content = content;

    res.status(200).json({
        message: '댓글이 성공적으로 수정되었습니다.',
        updatedComment: comment,
    });
});
*/



