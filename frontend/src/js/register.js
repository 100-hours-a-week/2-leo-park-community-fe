// /src/js/register.js

document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("loginButton");
    const registerButton = document.getElementById("registerButton");
    const imagePreview = document.getElementById("imagePreview");
    const registerProfileImage = document.getElementById("registerprofileImage");
    const previewImage = document.getElementById("previewImage");
    const backButton = document.getElementById("backButton");

    registerButton.addEventListener("click", (e) => {
        e.preventDefault();
        handleRegister();
    });

    loginButton.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/login";
    });

    // 프로필 이미지 프리뷰 영역을 클릭하면 파일 입력 창이 열리도록 이벤트 리스너 추가
    imagePreview.addEventListener("click", () => {
        registerProfileImage.click();
    });

    // 파일 선택 시 이미지 미리보기 업데이트
    registerProfileImage.addEventListener("change", (event) => {
        handleImagePreview(event, previewImage);
    });

    backButton.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/login";
    });
});

// 유효성 검사와 회원가입 처리 함수
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


// 프로필 이미지 사진 추가하여 기본 이미지 사진을 변경
function handleImagePreview(event) {
    const file = event.target.files[0];
    const previewImage = document.getElementById('previewImage');

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.style.display = 'block';
            previewImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        previewImage.style.display = 'none';
        previewImage.src = '';
    }
}

function handleRegister() {
    const emailInput = document.getElementById('registerUsername'); // 이메일
    const passwordInput = document.getElementById('registerPassword') // 비밀번호
    const passwordInputAgain = document.getElementById('registerPasswordagain'); // 비밀번호 확인
    const nicknameInput = document.getElementById('registerNickname'); // 닉네임
    const profileImageInput = document.getElementById('previewImage'); // 프로필 사진

    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const passwordAgainError = document.getElementById("passwordAgainError");
    const nicknameError = document.getElementById("nicknameError");

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const passwordAgain = passwordInputAgain.value.trim();
    const nickname = nicknameInput.value.trim();
    const profileImage = profileImageInput.src;

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

    // 비밀번호 확인 유효성 검사
    if (!passwordAgain) {
        passwordAgainError.textContent = "*비밀번호를 한번 더 입력해주세요.";
        isValid = false;
    } else if (password !== passwordAgain) {
        passwordAgainError.textContent = "*비밀번호가 다릅니다.";
        isValid = false;
    } else {
        passwordAgainError.textContent = "";
    }

    // 닉네임 유효성 검사
    if (!nickname) {
        nicknameError.textContent = "*닉네임을 입력해주세요.";
        isValid = false;
    } else if (nickname.length > 10) {
        nicknameError.textContent = "*닉네임은 최대 10자까지 작성가능합니다.";
        isValid = false;
    } else if (/\s/.test(nickname)) {
        nicknameError.textContent = "*띄어쓰기를 없애주세요.";
        isValid = false;
    } else {
        nicknameError.textContent = "";
    }

    // 이미 가입한 사람인지 확인하는 비교 로직 추가
    const userEmailCheck = users.find(u => u.email === email);

    if (userEmailCheck) {
        emailError.textContent = "*중복된 이메일입니다.";
        isValid = false;
    }

    const userNicknameCheck = users.find(u => u.nickname === nickname);

    if (userNicknameCheck) {
        nicknameError.textContent = "*중복된 닉네임입니다.";
        isValid = false;
    }


    if (!isValid) return;


    // fetch 단계에서 세션 스토리지에 사용자 정보를 임지 저장하기 위함(테스트용)
    // 아직 백서버에 연결을 하지 않았으니까 result.nickname, result.email로 하지 않고 user로 받음
    const user = users.find(u => u.email === email);

    sessionStorage.setItem('userNickname', user.nickname);
    sessionStorage.setItem('userEmail', user.email);
    sessionStorage.setItem("userProfileImage", user.profileImage);

    

    // API 요청
    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            password: password,
            nickname: nickname,
            profileImage: profileImage // 이미지 URL 전송
        }),
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.json().then(errorData => {
                    throw new Error(errorData.message);
                });
            }
        })
        .then(result => {
            // 회원가입 성공 시 사용자 정보를 세션 스토리지에 저장
            // SessionStorage에 저장하는 데이터는 fetch 요청 결과로 인증된 후에 서버에서 응답받은 사용자 정보를 의미!!

            sessionStorage.setItem('userNickname', result.nickname);
            sessionStorage.setItem('userEmail', result.email);
            sessionStorage.setItem("userProfileImage", result.profileImage);

            alert("회원가입이 완료되었습니다.");
            window.location.href = '/login'; // 로그인 페이지로 돌아가려면 어떻게? 여기에서 REST API 라우터가 쓰이는 건가..?
        })
        .catch(error => {
            console.error('회원가입 요청 중 오류 발생:', error);
            alert(`회원가입 실패: ${error.message}`);
        });
}


//////////////////////////////////////////////////////////////////////////////////////////////////////



/*
register() {
    const username = document.getElementById('registerUsername').value.trim(); // 이메일
    const password = document.getElementById('registerPassword').value; // 비밀번호
    const passwordAgain = document.getElementById('registerPasswordagain').value; // 비밀번호 확인
    const nickname = document.getElementById('registerNickname').value.trim(); // 닉네임
    const profileImage = document.getElementById('registerprofileImage').value; // 프로필 사진

    //// 이메일 유효성 검사 추가
    // 이메일을 입력하지 않았을 경우
    if (!username) {
        this.setState({
            emailError: '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)',
            passwordError: '',
            nicknameError: ''
        });
        return;
    }

    // 이메일이 너무 짧거나, 주어진 형식을 맞추지 않았을 경우
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (username.length < 5 || !emailPattern.test(username)) {
        this.setState({
            emailError: '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)',
            passwordError: '',
            nicknameError: ''
        });
        return;
    }

    // 중복 이메일 확인
    if (this.state.users.some(u => u.username === username)) {
        this.setState({
            emailError: '*중복된 이메일입니다.',
            passwordError: '',
            nicknameError: ''
        });
        return;
    }


    //// 비밀번호 유효성 검사 추가
    // 비밀번호를 입력하지 않았을 경우
    if (!password) {
        this.setState({
            emailError: '',
            passwordError: '*비밀번호를 입력해주세요'
        });
        return;
    }
    // 비밀번호가 주어진 형식을 맞추지 않았을 경우
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
    if (!passwordPattern.test(password)) {
        this.setState({
            emailError: '',
            passwordError: '*비밀번호는 8자 이상, 20자이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 1개 포함해야 합니다.'
        });
        return;
    }

    // 비밀번호 확인을 입력하지 않았을 경우
    if (!passwordAgain) {
        this.setState({
            emailError: '',
            passwordError: '*비밀번호를 한번 더 입력해주세요'
        });
        return;
    }

    // 비밀번호와 비밀번호 확인이 다를 경우
    if (password !== passwordAgain) {
        this.setState({
            emailError: '',
            passwordError: '*비밀번호가 다릅니다'
        });
        return;
    }

    //// 닉네임 유효성 검사 추가
    // 닉네임을 입력하지 않았을 경우
    if (!nickname) {
        this.setState({
            nicknameError: '*닉네임을 입력해주세요'
        });
        return;
    }

    // 닉네임이 10글자를 넘어갈 경우
    if (nickname.length > 10) {
        this.setState({
            nicknameError: '*닉네임은 최대 10자까지 작성가능합니다.'
        });
        return;
    }

    // 닉네임에 띄어쓰기가 들어갈 경우
    if (/\s/.test(nickname)) {
        this.setState({
            nicknameError: '*띄어쓰기를 없애주세요.'
        });
        return;
    }

    // 이미 중복된 닉네임이 있을 경우
    if (this.state.users.some(u => u.nickname === nickname)) {
        this.setState({
            nicknameError: '*중복된 닉네임입니다.'
        });
    }

    // 새 사용자 추가
    const newUser = { username, password, nickname, profileImage };
    this.setState({
        users: [...this.state.users, newUser],
        currentPage: 'login'
    });
    alert('회원가입이 완료되었습니다.'); // 여기도 헬퍼텍스트 형태로 바꿔야하나...?
}

*/