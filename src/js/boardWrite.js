// frontend/src/js/boardWrite.js

import { dropdownOptions } from '../../utils/dropDown.js';
import { logout } from '../../utils/logout.js';

document.addEventListener('DOMContentLoaded', async () => {
    const postTitleInput = document.getElementById('postTitle');
    const postContentInput = document.getElementById('postContent');
    const postImageInput = document.getElementById('postImage');
    const boardWriteButton = document.getElementById('boardWriteButton');
    const nicknameEditButton = document.getElementById('nicknameEditButton');
    const passwordEditButton = document.getElementById('passwordEditButton');
    const logoutButton = document.getElementById('logoutButton');
    const backButton = document.getElementById('backButton');
    const lottieContainer = document.getElementById('lottie-container');
    const lottieAnimation = document.getElementById('lottie-animation');

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

    backButton.addEventListener('click', e => {
        e.preventDefault();
        window.location.href = '/board';
    });

    let currentUserEmail;
    let currentUserNickname;
    let profileImage;

    // 게시글 추가 페이지 로드 시 서버로부터 사용자 정보 인가(login Success Startpoint)
    try {
        const response = await fetch('/api/user/profile', {
            method: 'GET',
            credentials: 'include', // 세션 쿠키를 포함하여 전송
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('로그인이 필요합니다.');
                window.location.href = '/login';
                return;
            }
            throw new Error('사용자 정보를 가져오는 데 실패했습니다.');
        }

        console.log('user 응답 받기 전'); // 디버깅
        const user = await response.json();
        console.log('user 응답 받은 후'); // 디버깅

        currentUserEmail = user.email;
        currentUserNickname = user.nickname;
        profileImage = user.profile_image;

        console.log('user:', user); // debug


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


    // 게시글 이미지 선택 시 아래에 이미지 미리보기 기능 추가
    postImageInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        const postImagePreview = document.getElementById('postImagePreview');

        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                postImagePreview.src = e.target.result;
                postImagePreview.style.display = 'block';
                postImagePreview.style.margin = '10px auto 0';
            };
            reader.readAsDataURL(file);
        } else {
            postImagePreview.style.display = 'none';
            postImagePreview.src = '';
        }
    });

    const animation = lottie.loadAnimation({
        container: lottieAnimation, // 애니메이션이 렌더링될 요소
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: '/public/animations/animation1.json', // 애니메이션 JSON 파일 경로
    });

    // animation.setSpeed(0.5); // 애니메이션 속도 설정

    // 게시글 작성 완료 버튼 클릭 이벤트
    boardWriteButton.addEventListener('click', async e => {
        e.preventDefault();

        const title = postTitleInput.value.trim();
        const content = postContentInput.value;
        const imageFile = postImageInput.files[0];

        // 게시글 추가 유효성 검사
        if (!title) {
            alert('제목을 입력해주세요.');
            return;
        }

        if (title.length > 26) {
            alert('제목은 최대 26자까지 가능합니다.');
            return;
        }

        if (!content) {
            alert('내용을 입력해주세요.');
            return;
        }

        // 애니메이션 실행 및 컨테이너 표시
        // Lottie 컨테이너와 메시지 표시
        const feedbackMessage = document.createElement('div');
        feedbackMessage.innerText = '게시글 등록 중...';
        feedbackMessage.style.position = 'absolute';
        feedbackMessage.style.color = 'black';
        feedbackMessage.style.fontSize = '18px';
        feedbackMessage.style.top = '70%';
        feedbackMessage.style.left = '50%';
        feedbackMessage.style.transform = 'translate(-50%, -50%)';
        feedbackMessage.style.background = 'white';
        lottieContainer.appendChild(feedbackMessage);
        lottieContainer.style.display = 'flex';
        lottieContainer.style.background = 'none';
        animation.goToAndPlay(0, true);

        // 이미지 파일 처리
        try {
            // 이미지 파일 처리
            let imageBase64 = null;
            if (imageFile) {
                const reader = new FileReader();
                reader.readAsDataURL(imageFile);
                await new Promise(resolve => {
                    reader.onload = function () {
                        imageBase64 = reader.result;
                        resolve();
                    };
                });
            }

            console.log('imageBase64:', imageBase64); // debug

            const postData = {
                title,
                content,
                image: imageBase64,
            };

            console.log('postData:', postData); // debug

            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(postData),
            });

            if (response.ok) {
                feedbackMessage.innerText = '게시글 등록 완료!';
                animation.addEventListener('complete', () => {
                    setTimeout(() => {
                        lottieContainer.style.display = 'none';
                        window.location.href = '/board';
                    }, 0); // 애니메이션 완료 후 대기 원할 경우 숫자 변경
                });
            } else {
                const errorData = await response.json();
                feedbackMessage.innerText = `등록 실패: ${errorData.message}`;
                console.error('등록 실패:', errorData);
            }
        } catch (error) {
            console.error('게시글 등록 중 오류 발생:', error);
            feedbackMessage.innerText = '게시글 등록 중 오류가 발생했습니다.';
        }
    });
});



