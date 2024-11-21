// /src/js/boardEdit.js

document.addEventListener('DOMContentLoaded', async () => {
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

    const currentUserNickname =
        sessionStorage.getItem('userNickname') || 'Anybody';
    const profileImage = sessionStorage.getItem('userProfileImage');

    if (profileImage) {
        const boardProfileImage = document.getElementById('boardProfileImage');
        boardProfileImage.src = profileImage;
    }

    // 프로필 이미지를 클릭하면 dropdownOptions() 함수 실행
    const boardProfileImage = document.getElementById('boardProfileImage');
    boardProfileImage.addEventListener('click', dropdownOptions);

    // URL에서 게시글 ID 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        alert('게시글 ID가 지정되지 않았습니다.');
        window.location.href = '/board';
        return;
    }

    let post = null;

    try {
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) {
            throw new Error('게시글을 가져오는 데 실패했습니다.');
        }
        post = await response.json();
        populateEditForm(post);
    } catch (error) {
        console.error(error);
        alert('게시글을 불러오는 중 오류가 발생했습니다.');
        window.location.href = '/board';
        return;
    }

    // 이미지 미리보기 처리
    const postImageInput = document.getElementById('postImage');
    postImageInput.addEventListener('change', e => {
        const postImagePreview = document.getElementById('postImagePreview');
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                postImagePreview.src = event.target.result;
                postImagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            postImagePreview.src = '';
            postImagePreview.style.display = 'none';
        }
    });

    // 폼 제출 처리
    const editPostForm = document.getElementById('editPostForm');
    editPostForm.addEventListener('submit', async e => {
        e.preventDefault();

        const postTitle = document.getElementById('postTitle').value.trim();
        const postContent = document.getElementById('postContent').value.trim();
        const postImageInput = document.getElementById('postImage');

        // 유효성 검사
        if (!postTitle) {
            alert('제목을 입력해주세요.');
            return;
        }

        if (postTitle.length > 26) {
            alert('제목은 최대 26자까지 가능합니다.');
            return;
        }

        if (!postContent) {
            alert('내용을 입력해주세요.');
            return;
        }

        // 이미지 파일 처리 (Base64 인코딩)
        let imageBase64 = null; // 게시글 이미지 초기화
        if (postImageInput.files && postImageInput.files[0]) {
            const file = postImageInput.files[0];
            const reader = new FileReader();

            reader.onload = async function (e) {
                imageBase64 = e.target.result;

                // 게시글 데이터 객체 생성
                const updatedPostData = {
                    title: postTitle,
                    content: postContent,
                    image: imageBase64,
                    author: post.author,
                    date: new Date().toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                    }),
                };

                // 백엔드로 데이터 전송
                try {
                    const response = await fetch(`/api/posts/${postId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'user-nickname': currentUserNickname,
                        },
                        body: JSON.stringify(updatedPostData),
                    });
                    if (!response.ok) {
                        throw new Error('게시글 수정에 실패했습니다.');
                    }
                    const data = await response.json();
                    alert(data.message);
                    window.location.href = `/boardDetail?id=${data.post.id}`;
                } catch (error) {
                    console.error('Error:', error);
                    alert('게시글 수정 중 오류가 발생했습니다.');
                }
            };

            reader.readAsDataURL(file);
        } else {
            // 이미지가 없는 경우 또는 변경하지 않는 경우
            const updatedPostData = {
                title: postTitle,
                content: postContent,
                image: null, // 기존 이미지 유지
                author: post.author,
                date: new Date().toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                }),
            };

            // 백엔드로 데이터 전송
            try {
                const response = await fetch(`/api/posts/${postId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'user-nickname': currentUserNickname,
                    },
                    body: JSON.stringify(updatedPostData),
                });
                if (!response.ok) {
                    throw new Error('게시글 수정에 실패했습니다.');
                }
                const data = await response.json();
                alert(data.message);
                window.location.href = `/boardDetail?id=${data.post.id}`;
            } catch (error) {
                console.error('Error:', error);
                alert('게시글 수정 중 오류가 발생했습니다.');
            }
        }
    });
});

// 로그아웃 함수
function logout() {
    sessionStorage.removeItem('userNickname');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userProfileImage');
    window.location.href = '/login';
}

// 프로필 옵션 드롭다운 함수
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

// 폼에 게시글 데이터를 채워주는 함수
function populateEditForm(post) {
    const postTitleInput = document.getElementById('postTitle');
    const postContentTextarea = document.getElementById('postContent');
    const postImagePreview = document.getElementById('postImagePreview');

    if (postTitleInput) {
        postTitleInput.value = post.title;
    }

    if (postContentTextarea) {
        postContentTextarea.value = post.content;
    }

    if (post.image && postImagePreview) {
        postImagePreview.src = post.image; // 베이스64 문자열 아니면 imageUrl
        postImagePreview.style.display = 'block'; // 게시글 이미지가 있으면 이미지가 보이도록 설정
    }
}
