// /src/js/nicknameEdit.js

document.addEventListener('DOMContentLoaded', async () => {
    const nicknameEditButton = document.getElementById('nicknameEditButton');
    const passwordEditButton = document.getElementById('passwordEditButton');
    const logoutButton = document.getElementById('logoutButton');
    const backButton = document.getElementById('backButton');
    const imagePreview = document.getElementById('imagePreview');
    const registerProfileImage = document.getElementById('registerprofileImage');
    const previewImage = document.getElementById('previewImage');
    const signoutButton = document.getElementById('signoutButton');
    const userEmailElement = document.getElementById('userEmail');
    const userNicknameInput = document.getElementById('userNickname');
    const editDoneButton = document.getElementById('editDoneButton');

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

        // 웹 페이지 화면에 로그인된 사용자의 이메일 및 닉네임 출력
        userEmailElement.textContent = currentUserEmail;
        userNicknameInput.placeholder = currentUserNickname;

        // 웹 페이지 화면에 로그인된 사용자의 프로필 이미지 출력
        previewImage.src = profileImage;

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

    signoutButton.addEventListener('click', async (e) => {
        e.preventDefault();
        signout();
    });

    backButton.addEventListener('click', e => {
        e.preventDefault();
        window.location.href = '/board';
    });

    // 프로필 이미지 프리뷰 영역을 클릭하면 파일 입력 창이 열리도록 이벤트 리스너 추가
    imagePreview.addEventListener('click', () => {
        registerProfileImage.click();
    });

    // 파일 선택 시 이미지 미리보기 업데이트
    registerProfileImage.addEventListener('change', event => {
        handleImagePreview(event, previewImage);
    });


    editDoneButton.addEventListener('click', async e => {
        e.preventDefault();

        // 새로운 닉네임과 프로필 이미지 값 가져오기
        const newNickname = userNicknameInput.value.trim();
        const newProfileImageFile = registerProfileImage.files[0];

        try {
            let profileImageData = null;

            // 프로필 이미지 업데이트 (새로운 파일이 있을 경우에만)
            if (newProfileImageFile) {
                const reader = new FileReader();
                reader.onload = async e => {
                    // 기존 profileImage 변수에 새 이미지 할당
                    profileImageData = e.target.result;

                    // nicknameEdit Startpoint(nickname & profileImage)
                    await updateAccount({
                        newNickname: newNickname || currentUserNickname,
                        profileImage: profileImageData,
                    });

                    // 응답 데이터로 UI 업데이트
                    userNicknameInput.placeholder = response.updatedNickname;
                    previewImage.src = response.updatedProfileImage;

                    alert('프로필이 성공적으로 업데이트되었습니다.');
                    window.location.href = '/nicknameEdit';
                };
                reader.readAsDataURL(newProfileImageFile);
            } else {
                // nicknameEdit Startpoint(only nickname)
                await updateAccount({
                    newNickname: newNickname || currentUserNickname,
                });

                // 응답 데이터로 UI 업데이트
                userNicknameInput.placeholder = response.updatedNickname;

                alert('프로필이 성공적으로 업데이트되었습니다.');
                window.location.href = '/nicknameEdit';
            }
        } catch (error) {
            console.error(error);
            alert('프로필 업데이트 중 오류가 발생했습니다.');
        }
    });

    async function updateAccount(data) {
        const response = await fetch(`/api/users/account`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '프로필 업데이트에 실패했습니다.');
        }
    }


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

// signout Startpoint
async function signout() {
    if (confirm('정말로 계정을 삭제하시겠습니까?')) {
        const response = await fetch('/api/users/delete', {
            method: 'DELETE',
            credentials: 'include',
        });

        if (response.ok) {
            alert('계정이 삭제되었습니다.');
            window.location.href = '/login';
        } else {
            const errorData = await response.json();
            alert(errorData.message || '계정 삭제에 실패했습니다.');
        }
    }
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


// ImagePreview function
function handleImagePreview(event) {
    const file = event.target.files[0];
    const previewImage = document.getElementById('previewImage');

    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            previewImage.style.display = 'block';
            previewImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        previewImage.style.display = 'none';
        previewImage.src = '';
    }
}
