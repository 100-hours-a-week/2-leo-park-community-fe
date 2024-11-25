// /src/js/boardWrite.js

document.addEventListener('DOMContentLoaded', async () => {
    const postTitleInput = document.getElementById('postTitle');
    const postContentInput = document.getElementById('postContent');
    const postImageInput = document.getElementById('postImage');
    const boardWriteButton = document.getElementById('boardWriteButton');
    const nicknameEditButton = document.getElementById('nicknameEditButton');
    const passwordEditButton = document.getElementById('passwordEditButton');
    const logoutButton = document.getElementById('logoutButton');
    const backButton = document.getElementById('backButton');

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

    // 게시글 추가 페이지 로드 시 서버로부터 사용자 정보 인가(login Success Startpoint)
    try {
        const response = await fetch('/api/user/profile', {
            method: 'GET',
            credentials: 'include', // 세션 쿠키를 포함하여 전송
        });

        if (response.status === 401) {
            alert('로그인이 필요합니다.');
            window.location.href = '/login';
            return;
        }

        const user = await response.json();
        currentUserNickname = user.nickname;
        profileImage = user.profileImage;

        // 프로필 이미지 설정 및 이벤트 리스너 추가
        const boardProfileImage = document.getElementById('boardProfileImage');
        boardProfileImage.src = profileImage;
        boardProfileImage.addEventListener('click', dropdownOptions);
    } catch (error) {
        console.error('사용자 정보를 불러오는 중 오류 발생:', error);
        alert('사용자 정보를 불러오는 데 실패했습니다. 다시 시도해주세요.');
        window.location.href = '/login';
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

    // 게시글 작성 완료 버튼 클릭 이벤트
    boardWriteButton.addEventListener('click', async e => {
        e.preventDefault();

        const title = postTitleInput.value.trim();
        const content = postContentInput.value.trim();
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

        // 이미지 파일 처리 (Base64 인코딩)
        let imageBase64 = null;
        if (imageFile) {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onload = async () => {
                imageBase64 = reader.result;

                // 게시글 데이터 객체 생성
                const postData = {
                    title,
                    content,
                    image: imageBase64
                };

                // boardWrite Startpoint
                const response = await fetch('/api/posts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(postData),
                });

                if (response.ok) {
                    alert('게시글이 성공적으로 등록되었습니다.');
                    window.location.href = '/board';
                } else {
                    const errorData = await response.json();
                    alert(`게시글 등록 실패: ${errorData.message}`);
                }
            };
            reader.onerror = error => {
                console.error('이미지 파일 처리 중 오류 발생:', error);
                alert('이미지 파일 처리 중 오류가 발생했습니다.');
            };
        } else {
            // 이미지가 없는 경우 바로 데이터 전송
            const postData = {
                title,
                content,
                image: null,
            };

            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(postData),
            });

            if (response.ok) {
                alert('게시글이 성공적으로 등록되었습니다.');
                window.location.href = '/board';
            } else {
                const errorData = await response.json();
                alert(`게시글 등록 실패: ${errorData.message}`);
            }
        }
    });
});


// logout Startpoint
function logout() {
    // 서버로 로그아웃 요청
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


