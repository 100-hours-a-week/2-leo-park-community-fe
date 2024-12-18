// /src/js/register.js

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    const registerButton = document.getElementById('registerButton');
    const backButton = document.getElementById('backButton');
    const imagePreview = document.getElementById('imagePreview');
    const registerProfileImage = document.getElementById('registerprofileImage');
    const previewImage = document.getElementById('previewImage'); // 프로필 사진
    
    registerButton.addEventListener('click', e => {
        e.preventDefault();
        handleRegister();
    });

    loginButton.addEventListener('click', e => {
        e.preventDefault();
        window.location.href = '/login';
    });

    // 프로필 이미지 프리뷰 영역을 클릭하면 파일 입력 창이 열리도록 이벤트 리스너 추가
    imagePreview.addEventListener('click', () => {
        registerProfileImage.click();
    });

    // 파일 선택 시 이미지 미리보기 업데이트
    registerProfileImage.addEventListener('change', event => {
        handleImagePreview(event, previewImage);
    });

    backButton.addEventListener('click', e => {
        e.preventDefault();
        window.location.href = '/login';
    });
});


async function handleRegister() {
    const emailInput = document.getElementById('registerUsername'); // 이메일
    const passwordInput = document.getElementById('registerPassword'); // 비밀번호
    const passwordInputAgain = document.getElementById('registerPasswordagain'); // 비밀번호 확인
    const nicknameInput = document.getElementById('registerNickname'); // 닉네임
    const previewImage = document.getElementById('previewImage'); // 프로필 사진

    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const passwordAgainError = document.getElementById('passwordAgainError');
    const nicknameError = document.getElementById('nicknameError');

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const passwordAgain = passwordInputAgain.value.trim();
    const nickname = nicknameInput.value.trim();

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

    // 비밀번호 확인 유효성 검사
    if (!passwordAgain) {
        passwordAgainError.textContent = '*비밀번호를 한번 더 입력해주세요.';
        isValid = false;
    } else if (password !== passwordAgain) {
        passwordAgainError.textContent = '*비밀번호가 다릅니다.';
        isValid = false;
    } else {
        passwordAgainError.textContent = '';
    }

    // 닉네임 유효성 검사
    if (!nickname) {
        nicknameError.textContent = '*닉네임을 입력해주세요.';
        isValid = false;
    } else if (nickname.length > 10) {
        nicknameError.textContent = '*닉네임은 최대 10자까지 작성가능합니다.';
        isValid = false;
    } else if (/\s/.test(nickname)) {
        nicknameError.textContent = '*띄어쓰기를 없애주세요.';
        isValid = false;
    } else {
        nicknameError.textContent = '';
    }

    if (!isValid) return;

    // 프로필 이미지 Base64 데이터 여부 확인
    // 이미지가 선택되었고 previewImage.src가 data:image/... 형식을 가질 때만 profile_image 전송
    let profile_image = null;
    if (previewImage.src && previewImage.src.startsWith('data:image/')) {
        profile_image = previewImage.src;
    }

    const requestData = {
        email,
        password,
        nickname,
        // 프로필 이미지를 선택하지 않은 경우 profile_image 필드 전송 안 함
        ...(profile_image ? { profile_image } : {})
    };

    // register Startpoint
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData),
        });

        const result = await response.json();

        if (!response.ok) {
            // 서버에서 온 에러 처리
            if (result.errorField === 'email') {
                emailError.textContent = result.message;
            } else if (result.errorField === 'nickname') {
                nicknameError.textContent = result.message;
            } else {
                alert(`오류 발생: ${result.message}`);
            }
        } else {
            // 회원가입 성공
            alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('회원가입 요청 중 오류 발생:', error);
        alert('회원가입 중 문제가 발생했습니다. 다시 시도해주세요.');
    }
}

// ImagePreview function
function handleImagePreview(event, previewImage) {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            previewImage.style.display = 'block';
            previewImage.src = e.target.result;
        };
        reader.onerror = () => {
            console.error('이미지 로딩 중 오류 발생');
            previewImage.style.display = 'none';
            previewImage.src = '';
        };
        reader.readAsDataURL(file);
    } else {
        // 이미지가 선택되지 않은 경우
        previewImage.style.display = 'none';
        previewImage.src = '';
    }
}

