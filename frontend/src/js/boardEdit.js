// /src/js/boardEdit.js

import { dropdownOptions } from '../../utils/dropDown.js';
import { logout } from '../../utils/logout.js';

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

    let currentUserEmail;
    let currentUserNickname;
    let profileImage;

    // 게시글 수정 페이지 로드 시 서버로부터 사용자 정보 인가(login Success Startpoint)
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
        boardProfileImage.replaceWith(boardProfileImage.cloneNode(true));
        boardProfileImage.addEventListener('click', (event) => {
            dropdownOptions(event, '#boardProfileImage', '#profileOptions');
        });
    } catch (error) {
        console.error('사용자 정보를 불러오는 중 오류 발생:', error);
        alert('사용자 정보를 불러오는 데 실패했습니다. 다시 시도해주세요.');
        window.location.href = '/board';
        return;
    }

    // URL에서 게시글 ID 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        alert('게시글 ID가 지정되지 않았습니다.');
        window.location.href = '/board';
        return;
    }

    let post;

    // boardEdit Startpoint
    try {
        const response = await fetch(`/api/posts/${postId}`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('게시글을 가져오는 데 실패했습니다.');
        }
        post = await response.json();

        // 현재 로그인한 사용자가 작성자인지 확인(확실한 예방을 위해 추가)
        if (post.author !== currentUserNickname) {
            alert('게시글 수정 권한이 없습니다.');
            window.location.href = '/board';
            return;
        }

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
        let imageBase64 = null; 
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
                };

                // 백엔드로 데이터 전송
                try {
                    const response = await fetch(`/api/posts/${postId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify(updatedPostData),
                    });
                    if (!response.ok) {
                        throw new Error(errorData.message || '게시글 수정에 실패했습니다.');
                    }
                    const data = await response.json();
                    console.log('data:', data); // 디버깅
                    alert(data.message);
                    window.location.href = `/boardDetail?id=${postId}`;
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
                image: null,
            };

            // 백엔드로 데이터 전송
            try {
                const response = await fetch(`/api/posts/${postId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(updatedPostData),
                });
                if (!response.ok) {
                    throw new Error('게시글 수정에 실패했습니다.');
                }
                const data = await response.json();
                console.log('data:', data); // 디버깅
                alert(data.message);
                // 수정된 게시글 정보를 사용하여 화면 리디렉션
                window.location.href = `/boardDetail?id=${postId}`;
            } catch (error) {
                console.error('Error:', error);
                alert(error.message || '게시글 수정 중 오류가 발생했습니다.');
            }
        }
    });
});


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
