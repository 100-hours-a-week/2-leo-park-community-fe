// /backend/routes/api.js

const express = require('express');

const router = express.Router();
const bcrypt = require('bcrypt');

// NOTE: 게시글 및 댓글 수정/삭제 엔드포인트에서 작성자 확인을 위한 유틸 함수
const { isAuthor } = require('../utils/authorization');
// NOTE: 게시글 이미지를 추가하고 수정할 때, json body에 게시글 제목하고 내용과 함께 담아 한번에 보내고 싶어서 base64로 인코딩함
const { saveBase64Image } = require('../utils/base64Encoding');

// // Multer 설정
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'public/uploads/'); // 업로드된 파일을 저장할 폴더
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + path.extname(file.originalname)); // 파일 이름 설정
//     }
// });
// const upload = multer({ storage: storage });

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
        id: 1,
        title: '첫 번째 게시글',
        content: '이것은 첫 번째 게시글의 내용입니다.',
        author: '작성자1',
        date: '2024-01-01 12:00:00',
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
        image: '/public/images/KTB_zoom_yellow.jpg',
    },
    {
        id: 2,
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

/* ============ 사용자 인증 관련 라우트 ============ */

// 서버 -> 클라이언트 로그인 응답
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // 이메일이 제공되었는지 확인
    if (!email) {
        return res
            .status(400)
            .json({ errorField: 'email', message: '이메일을 입력해주세요.' });
    }

    // 비밀번호가 제공되었는지 확인
    if (!password) {
        return res.status(400).json({
            errorField: 'password',
            message: '비밀번호를 입력해주세요.',
        });
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(401).json({
            errorField: 'email',
            message: '등록되지 않은 이메일입니다.',
        });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
        return res.status(401).json({
            errorField: 'password',
            message: '비밀번호가 일치하지 않습니다.',
        });
    }

    // 로그인 성공 시 사용자 정보 반환
    res.json({
        email: user.email,
        nickname: user.nickname,
        profileImage: user.profileImage,
    });
});

// 서버 -> 클라이언트 회원가입 응답
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
        profileImage: profileImage || '/public/images/default-profile.png', // 기본 이미지 설정
    };

    users.push(newUser); // 실제로는 데이터베이스에 저장해야 합니다.

    // 8. 성공 응답
    return res.status(201).json({
        message: '회원가입이 완료되었습니다.',
        email: newUser.email,
        nickname: newUser.nickname,
        profileImage: newUser.profileImage,
    });
});

/* ============ 게시글 및 댓글 관련 라우트 ============ */

// 모든 게시글 데이터 반환 엔드포인트
router.get('/posts', (req, res) => {
    console.log('클라이언트에서 /api/posts 관련 GET 요청이 도착했습니다.'); // debug
    res.json(posts);
});

// 게시글 추가 엔드포인트
router.post('/posts', (req, res) => {
    const { title, content, image, author, date } = req.body;

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
        id: posts.length > 0 ? posts[posts.length - 1].id + 1 : 1,
        title,
        content,
        image: null,
        author,
        date,
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
    posts.push(newPost);

    res.status(201).json({
        message: '게시글이 성공적으로 등록되었습니다.',
        post: newPost,
    });
});

// 특정 게시글 조회 엔드포인트
router.get('/posts/:id', (req, res) => {
    const { id } = req.params;
    const post = posts.find(p => p.id === parseInt(id, 10));

    if (!post) {
        return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    res.json(post);
});

// 조회수 증가 엔드포인트
router.post('/posts/:id/views', (req, res) => {
    const { id } = req.params;

    const post = posts.find(p => p.id === parseInt(id, 10));

    if (!post) {
        return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    post.views += 1;

    res.json({ views: post.views });
});

// 좋아요 증가 엔드포인트
router.post('/posts/:id/like', (req, res) => {
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

// 댓글 등록 엔드포인트
router.post('/posts/:id/comments', (req, res) => {
    const { id } = req.params;
    const { content, author, date } = req.body;

    const post = posts.find(p => p.id === parseInt(id, 10));

    if (!post) {
        return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    const newComment = {
        id: post.comments.length + 1,
        author,
        content,
        date,
    };

    post.comments.push(newComment);

    res.status(201).json(newComment);
});

// 게시글 삭제 엔드포인트
router.delete('/posts/:id', (req, res) => {
    const { id } = req.params;
    const userNickname = req.headers['user-nickname']; // 요청 헤더에서 사용자 닉네임 가져오기

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

// 게시글 수정 엔드포인트
router.put('/posts/:id', (req, res) => {
    const { id } = req.params;
    const { title, content, image } = req.body;
    const userNickname = req.headers['user-nickname']; // 요청 헤더에서 사용자 닉네임 가져오기

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

// // 이미지 업로드 엔드포인트(multer 모듈 사용 시에만 활성화)
// router.post('/upload', upload.single('image'), (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ message: '이미지를 업로드하지 않았습니다.' });
//     }

//     // 업로드된 이미지의 URL을 반환
//     const imageUrl = `/uploads/${req.file.filename}`;
//     res.status(200).json({ imageUrl: imageUrl });
// });

// 댓글 삭제 엔드포인트
router.delete('/posts/:postId/comments/:commentId', (req, res) => {
    const { postId, commentId } = req.params;
    const userNickname = req.headers['user-nickname']; // 요청 헤더에서 사용자 닉네임 가져오기

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

// 댓글 수정 엔드포인트
router.put('/posts/:postId/comments/:commentId', (req, res) => {
    const postId = parseInt(req.params.postId, 10);
    const commentId = parseInt(req.params.commentId, 10);
    const { content } = req.body;
    const userNickname = req.headers['user-nickname'];

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

    res.status(200).json(comment);
});

module.exports = router;
