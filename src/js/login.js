// /src/js/login.js

const API_URL = window.APP_CONFIG.API_URL;

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    const registerButton = document.getElementById('registerButton');

    loginButton.addEventListener('click', e => {
        e.preventDefault();
        handleLogin();
    });

    registerButton.addEventListener('click', e => {
        e.preventDefault();
        window.location.href = '/register';
    });
});

// 유효성 검사와 로그인 처리 함수

function handleLogin() {
    const emailInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    let isValid = true;

    // 이메일 유효성 검사
    if (!email) {
        emailError.textContent =
            '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)';
        isValid = false;
    } else if (
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
    ) {
        emailError.textContent =
            '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)';
        isValid = false;
    } else {
        emailError.textContent = '';
    }

    // 비밀번호 유효성 검사
    if (!password) {
        passwordError.textContent = '*비밀번호를 입력하세요.';
        isValid = false;
    } else if (
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/.test(
            password,
        )
    ) {
        passwordError.textContent =
            '*비밀번호는 8~20자, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.';
        isValid = false;
    } else {
        passwordError.textContent = '';
    }

    // isValid가 false일 경우, 서버에 로그인 요청을 하는 다음 코드를 실행하지 않도록 작성
    // 유효성 검사에서 오류가 발생하면 바로 return을 통해 handleLogin() 바깥으로 빠져나감
    // 이메일과 비밀번호가 잘못 입력된 상태에서 API 요청 금지
    if (!isValid) return;

    // login Startpoint
    fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // 세션 쿠키를 포함하여 전송
        body: JSON.stringify({ email, password }),
    })
        .then(response => response.json())
        .then(result => {
            console.log('로그인 응답:', result); // 디버깅을 위한 콘솔 로그 추가

            if (result.error) {
                // 서버에서 온 에러 처리
                if (result.errorField === 'email') {
                    emailError.textContent = result.message;
                } else if (result.errorField === 'password') {
                    passwordError.textContent = result.message;
                } else {
                    alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
                }
            } else {
                // 로그인 성공 처리
                alert('WELCOME to 🌴 Palm Tree World! 🌴');
                window.location.href = '/board'; // 게시글 목록조회 페이지로 이동
            }
        })
        .catch(error => {
            console.error('로그인 요청 중 오류 발생:', error);
            alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
        });
}


