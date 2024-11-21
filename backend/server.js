// /backend/server.js

const express = require('express');
const path = require('path');
const cors = require('cors');

// express() 함수를 호출하여 app이라는 객체를 생성, app이라는 객체는 웹서버의 기능을 가지고 있음
const app = express();

// CORS 설정
app.use(
    cors({
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'user-nickname'],
    }),
);

// JSON 바디 파싱을 위해 미들웨어 설정 (application/json)
app.use(express.json());

// URL-인코딩된 바디 파싱을 위한 미들웨어 설정 (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공 경로
// /public으로 시작하는 요청에 대해 /frontend/public 폴더 안에 있는 정적 리소스를 제공하겠다는 의미
app.use(
    '/public',
    express.static(path.resolve(__dirname, '..', 'frontend', 'public')),
); // css & images
app.use(
    '/src',
    express.static(path.resolve(__dirname, '..', 'frontend', 'src')),
); // js & views

// 라우터 임포트
const apiRoutes = require('./routes/api.js');
const mainRoutes = require('./routes/mainRoutes.js');

// 라우터 등록
app.use('/api', apiRoutes); // API 라우터 등록(데이터 처리 및 비지니스 로직 관련 처리 담당)
app.use('/', mainRoutes); // 메인 페이지 라우터 등록(정적 페이지 제공 담당)

// // 여기에 나중에는 페이지별로 다른 라우트로 연결되서 다른 페이지로 가도록 해야하나??
// app.get("/*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "..", "frontend", "src", "views", "login.html"));
// });

// // app.get("/*", (req, res) => {...}) 라는 코드는 모든 요청에 대해 frontend/index.html 파일을 보내준다.
// // 이것은 SPA의 핵심 원리인데, 하나의 HTML 파일만으로 모든 화면을 구성하기 때문에 서버에서는 항상 같은 HTML 파일을 제공

app.listen(process.env.PORT || 3000, () =>
    console.log('[💥 시작] : Server running...'),
);
// app.listen(process.env.PORT || 3000, () => console.log("Server running...")) 라는 코드는 웹 서버를 실행
// 환경 변수에 PORT 값이 있으면 그 값을 포트 번호로 사용하고, 없으면 3000번 포트를 사용하겠다는 의미
// 웹 서버가 실행되면 콘솔에 “Server running…” 이라고 출력

// 여기까지 한 상태에서 터미널 창에 node server.js
