// /src/js/nicknameEdit.js

import { dropdownOptions } from '../../utils/dropDown.js';
import { logout } from '../../utils/logout.js';
import { signout } from '../../utils/signout.js';
import { readFileAsBase64 } from '../../utils/readFileAsBase64.js';

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

    let currentUserEmail;
    let currentUserNickname;
    let profileImage;

    // 회원정보수정(닉네임) 페이지 로드 시 서버로부터 사용자 정보 인가(login Success Startpoint)
    try {
        const response = await fetch('/api/user/profile', {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('로그인이 필요합니다.');
                window.location.href = '/login';
                return;
            }
            throw new Error('사용자 정보를 가져오는 데 실패했습니다.');
        }

        const user = await response.json();
        console.log('user:', user); // debug

        currentUserEmail = user.email;
        currentUserNickname = user.nickname;
        profileImage = user.profile_image;

        // 웹 페이지 화면에 로그인된 사용자의 이메일 및 닉네임 출력
        userEmailElement.textContent = currentUserEmail;
        userNicknameInput.placeholder = currentUserNickname;

        // 웹 페이지 화면에 로그인된 사용자의 프로필 이미지 출력
        previewImage.src = profileImage;

        // 프로필 이미지에 드롭다운 옵션 추가
        const boardProfileImage = document.getElementById('boardProfileImage');
        boardProfileImage.src = profileImage;
        // boardProfileImage.replaceWith(boardProfileImage.cloneNode(true));
        boardProfileImage.addEventListener('click', (event) => {
            dropdownOptions(event, '#boardProfileImage', '#profileOptions');
        });
    } catch (error) {
        console.error('사용자 정보를 불러오는 중 오류 발생:', error);
        alert('사용자 정보를 불러오는 데 실패했습니다. 다시 시도해주세요.');
        window.location.href = '/board';
        return;
    }

    // 프로필 이미지 프리뷰 영역을 클릭하면 파일 입력 창이 열리도록 이벤트 리스너 추가
    imagePreview.addEventListener('click', () => {
        registerProfileImage.click();
    });

    // 파일 선택 시 이미지 미리보기 업데이트
    registerProfileImage.addEventListener('change', event => {
        handleImagePreview(event, previewImage);
    });

    // 닉네임 또는 프로필 사진 수정 완료 버튼
    editDoneButton.addEventListener('click', async e => {
        e.preventDefault();

        const new_nickname = userNicknameInput.value.trim() || currentUserNickname;
        const newProfileImageFile = registerProfileImage.files[0];

        let profileImageData = null;
        if (newProfileImageFile) {
            profileImageData = await readFileAsBase64(newProfileImageFile);
        }

        try {
            const result = await updateAccount({
                new_nickname,
                profile_image: profileImageData
            });

            // 응답 데이터로 UI 업데이트
            userNicknameInput.placeholder = result.updatedNickname;
            previewImage.src = result.updatedProfileImage;

            alert('프로필이 성공적으로 업데이트되었습니다.');
            window.location.href = '/board';
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
        return  response.json(); // 응답 결과 반환
    }
});


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
