// /src/js/passwordEdit.js

document.addEventListener('DOMContentLoaded', async () => {
    const nicknameEditButton = document.getElementById('nicknameEditButton');
    const passwordEditButton = document.getElementById('passwordEditButton');
    const logoutButton = document.getElementById('logoutButton');
    const editedPasswordInput = document.getElementById('editedPassword');
    const editedPasswordAgainInput = document.getElementById('editedPasswordAgain');
    const editDoneButton = document.getElementById('editDoneButton');
    const passwordError = document.getElementById('passwordError');
    const passwordAgainError = document.getElementById('passwordAgainError');

    // 회원정보수정(닉네임) 페이지 로드 시 서버로부터 사용자 정보 인가(login Success Startpoint)
    try {
        const response = await fetch('/api/user/profile', {
            method: 'GET',
            credentials: 'include',
        });

        if (response.status === 401) {
            alert('로그인이 필요합니다.');
            window.location.href = '/login';
            return;
        }

        const user = await response.json();
        currentUserEmail = user.email;
        currentUserNickname = user.nickname;
        profileImage = user.profileImage;

        const boardProfileImage = document.getElementById('boardProfileImage');
        boardProfileImage.src = profileImage;
        boardProfileImage.addEventListener('click', dropdownOptions);
    } catch (error) {
        console.error('사용자 정보를 불러오는 중 오류 발생:', error);
        alert('사용자 정보를 불러오는 데 실패했습니다. 다시 시도해주세요.');
        window.location.href = '/login';
        return;
    }

    nicknameEditButton.addEventListener('click', e => {
        e.preventDefault();
        window.location.href = '/nicknameEdit';
    });

    passwordEditButton.addEventListener('click', e => {
        e.preventDefault();
        window.location.href = '/passwordEdit';
    });

    logoutButton.addEventListener('click', e => {
        e.preventDefault();
        logout();
    });

    editDoneButton.addEventListener('click', async e => {
        e.preventDefault();

        const editedPassword = editedPasswordInput.value.trim();
        const editedPasswordAgain = editedPasswordAgainInput.value.trim();

        let isValid = true;

        // 변경 비밀번호 유효성 검사
        if (!editedPassword) {
            passwordError.textContent = '*비밀번호를 입력하세요.';
            isValid = false;
        } else if (
            !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/.test(
                editedPassword,
            )
        ) {
            passwordError.textContent =
                '*비밀번호는 8~20자, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.';
            isValid = false;
        } else {
            passwordError.textContent = '';
        }

        // 변경 비밀번호 확인 유효성 검사
        if (!editedPasswordAgain) {
            passwordAgainError.textContent = '*비밀번호를 한번 더 입력해주세요.';
            isValid = false;
        } else if (editedPassword !== editedPasswordAgain) {
            passwordAgainError.textContent = '*비밀번호가 다릅니다.';
            isValid = false;
        } else {
            passwordAgainError.textContent = '';
        }

        if (!isValid) {
            return;
        }

        // 비밀번호 업데이트 요청
        try {
            const response = await fetch('/api/users/password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    newPassword: editedPassword,
                }),
            });

            if (response.ok) {
                alert('비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.');
                window.location.href = '/login';
            } else {
                const errorData = await response.json();
                alert(errorData.message || '비밀번호 변경에 실패했습니다.');
            }
        } catch (error) {
            console.error('비밀번호 변경 중 오류 발생:', error);
            alert('비밀번호 변경 중 오류가 발생했습니다.');
        }
    })

});


// logout Startpoint
function logout() {
    fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
    })
        .then(response => response.json())
        .then(result => {
            if (!result.error) {
                alert('로그아웃되었습니다.');
                window.location.href = '/login';
            } else {
                alert('로그아웃 중 오류가 발생했습니다.');
            }
        })
        .catch(error => {
            console.error('로그아웃 요청 중 오류 발생:', error);
            alert('로그아웃 중 오류가 발생했습니다.');
        });
}


// dropDown function
function dropdownOptions(event) {
    event.stopPropagation();
    const options = document.getElementById('profileOptions');
    options.style.display = options.style.display === 'none' ? 'block' : 'none';

    // 다른 곳을 클릭하면 옵션 메뉴가 닫히도록 이벤트 리스너 추가
    document.addEventListener('click', function closeOptions(e) {
        if (
            !e.target.closest('#profileOptions') &&
            !e.target.closest('#boardProfileImage')
        ) {
            options.style.display = 'none';
            document.removeEventListener('click', closeOptions);
        }
    });
}
