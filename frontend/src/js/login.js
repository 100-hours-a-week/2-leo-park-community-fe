// /src/js/login.js

document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("loginButton");
    const registerButton = document.getElementById("registerButton");

    loginButton.addEventListener("click", (e) => {
        e.preventDefault();
        handleLogin();
    });

    registerButton.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/register";
    });
});

// 유효성 검사와 로그인 처리 함수
// HACK: 임시로 사용자 확인 로직을 위한 테스트용 users 더미 데이터 추가
const users = [
    {
        email: "test@example.com",
        password: "Test1234!", // 나중에는 암호화된 비밀번호로 저장해야함
        nickname: "테스트 사용자",
        profileImage: "/frontend/public/images/default-profile.png"
    },
    {
        email: "admin@example.com",
        password: "Admin1234!",
        nickname: "관리자",
        profileImage: "/frontend/public/images/default-profile.png"
    }
];

function handleLogin() {
    const emailInput = document.getElementById("loginUsername");
    const passwordInput = document.getElementById("loginPassword");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    let isValid = true;

    // 이메일 유효성 검사
    if (!email) {
        emailError.textContent = "*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)";
        isValid = false;
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        emailError.textContent = "*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)";
        isValid = false;
    } else {
        emailError.textContent = "";
    }

    // 비밀번호 유효성 검사
    if (!password) {
        passwordError.textContent = "*비밀번호를 입력하세요.";
        isValid = false;
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/.test(password)) {
        passwordError.textContent = "*비밀번호는 8~20자, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.";
        isValid = false;
    } else {
        passwordError.textContent = "";
    }


    // isValid가 false일 경우, 서버에 로그인 요청을 하는 다음 코드를 실행하지 않도록 작성
    // 유효성 검사에서 오류가 발생하면 바로 return을 통해 handleLogin() 바깥으로 빠져나감
    // 이메일과 비밀번호가 잘못 입력된 상태에서 API 요청 금지
    if (!isValid) return;


    // 사용자 확인 로직 추가
    const user = users.find(u => u.email === email);
    
    if (!user) {
        emailError.textContent = "등록되지 않은 이메일입니다.";
        return;
    }

    if (user.password !== password) {
        passwordError.textContent = "비밀번호가 일치하지 않습니다.";
        return;
    }




    // API 요청
    fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },  
        // 사용자가 웹 브라우저에서 입력한 정보를 body에 담아서 JSON 형태로 서버에 보내는 과정(요청)
        // fetch 요청에서 보내는 데이터는 서버의 인증을 위한 입력값!!
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (!response.ok) throw new Error("로그인 실패");
        return response.json();
    })
    .then(result => {
        // 로그인 성공 시 사용자 정보를 세션 스토리지에 저장
        // SessionStorage에 저장하는 데이터는 fetch 요청 결과로 인증된 후에 서버에서 응답받은 사용자 정보를 의미!!
        
        sessionStorage.setItem('userNickname', result.nickname);
        sessionStorage.setItem('userEmail', result.email);
        
        alert(`환영합니다, ${user.nickname}님!`);
        window.location.href = "/board"; // 여기에 게시글페이지로 이동하는거 추가해야함
    })
    .catch(error => {
        console.error(error);
        alert("로그인 중 문제가 발생했습니다. 다시 시도해주세요.");
    });
}




//////////////////////////////////////////////////////////////////////////////////////////////////////




/*
class Login {
    constructor(users) {
        this.users = users;
        this.state = {
            emailError: '',
            passwordError: '',
        };
    }

    // 로그인 함수
    login() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        if (!username) {
            this.setState({
                emailError: '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)',
                passwordError: ''
            });
            return;
        }
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(username)) {
            this.setState({
                emailError: '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)',
                passwordError: ''
            });
            return;
        }

        if (!password) {
            this.setState({
                emailError: '',
                passwordError: '*비밀번호를 입력해주세요'
            });
            return;
        }

        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
        if (!passwordPattern.test(password)) {
            this.setState({
                emailError: '',
                passwordError: '*비밀번호는 8자 이상, 20자이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 1개 포함해야 합니다.'
            });
            return;
        }

        const userWithEmail = this.users.find(u => u.username === username);
        if (!userWithEmail) {
            this.setState({
                emailError: '*존재하지 않는 이메일입니다.',
                passwordError: ''
            });
            return;
        }

        if (userWithEmail.password !== password) {
            this.setState({
                emailError: '',
                passwordError: '*비밀번호가 다릅니다.'
            });
            return;
        }

        this.setState({
            emailError: '',
            passwordError: '',
            currentPage: 'dashboard'  // 로그인 후 대시보드 페이지로 이동
        });
    }

    // 상태 업데이트
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.render();
    }

    // 로그인 페이지 템플릿
    loginTemplate() {
        const emailErrorHtml = this.state.emailError ?
            `<div class="helper-text" style="color: red">${this.state.emailError}</div>` : '';

        const passwordErrorHtml = this.state.passwordError ?
            `<div class="helper-text" style="color: red">${this.state.passwordError}</div>` : '';

        return `
        <div class="base-header">
            <h1>아무 말 대잔치</h1>
            <hr>
        </div>
        <div class="container">
            <h2 class="form-title">로그인</h2>
            <div class="login-form">
                <div class="label-container">
                    <label for="loginUsername" class="login-label">이메일</label>
                </div>
                <input type="text" id="loginUsername" placeholder="이메일을 입력하세요" autocomplete="username" />
                ${emailErrorHtml}
            </div>
            <div class="login-form">
                <div class="label-container">
                    <label for="loginPassword" class="login-label">비밀번호</label>
                </div>
                <input type="password" id="loginPassword" placeholder="비밀번호를 입력하세요" autocomplete="current-password" />
                ${passwordErrorHtml}
            </div>
            <div class="login-button-container">
                <button class="login-button" id="loginButton">로그인</button>
                <button class="login-button secondary" id="registerButton">회원가입</button>
            </div>
        </div>
        `;
    }
        

    // 화면 렌더링
    render() {
        document.getElementById('app').innerHTML = this.loginTemplate();
        document.getElementById('loginButton').addEventListener('click', () => this.login());
        document.getElementById('registerButton').addEventListener('click', () => {
            this.setState({ currentPage: 'register' });
        });
    }
        
}

// 예시 사용자 데이터
const users = [
    { username: 'test@example.com', password: 'Test@1234' }
];

// 로그인 인스턴스 생성
const login = new Login(users);
login.render();

*/