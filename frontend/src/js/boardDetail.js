// /src/js/boardDetail.js

document.addEventListener('DOMContentLoaded', async () => {
    const nicknameEditButton = document.getElementById('nicknameEditButton');
    const passwordEditButton = document.getElementById('passwordEditButton');
    const logoutButton = document.getElementById('logoutButton');
    const backButton = document.getElementById('backButton');
    const boardEditButton = document.getElementById('editButton');
    const boardDeleteButton = document.getElementById('deleteButton');
    const likeButton = document.getElementById('likeButton');
    const addCommentButton = document.getElementById('addCommentButton');

    // 이벤트 리스너 설정
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

    boardEditButton.addEventListener('click', () => {
        window.location.href = `/boardEdit?id=${postId}`;
    });

    // 게시글 상세조회 페이지 로드 시 서버로부터 사용자 정보 인가(login Success Startpoint)
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
        currentUserEmail = user.email;
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

    // NOTE: URL에서 게시글 ID 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    let selectedPost = null;

    // boardDetail Startpoint
    try {
        const response = await fetch(`/api/posts/${postId}`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('게시글을 가져오는 데 실패했습니다.');
        }
        selectedPost = await response.json();

        // boardDetail views Startpoint
        await fetch(`/api/posts/${postId}/views`, { method: 'POST' });

        // 게시글 정보 표시
        displayPost(selectedPost, currentUserNickname);
    } catch (error) {
        console.error(error);
        alert('게시글을 불러오는 중 오류가 발생했습니다.');
    }

    // boardDetail likes Startpoint
    likeButton.addEventListener('click', async () => {
        try {
            await fetch(`/api/posts/${postId}/likes`, { method: 'POST' });
            selectedPost.likes += 1;
            document.getElementById('likeCount').innerText = selectedPost.likes;
        } catch (error) {
            console.error(error);
            alert('좋아요 처리 중 오류가 발생했습니다.');
        }
    });

    // boardDetail comments add Startpoint
    addCommentButton.addEventListener('click', async () => {
        const commentContent = document
            .getElementById('commentContent')
            .value.trim();
        if (!commentContent) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }

        const newComment = {
            content: commentContent,
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

        try {
            const response = await fetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(newComment),
            });
            if (!response.ok) {
                throw new Error('댓글 추가에 실패했습니다.');
            }
            const addedComment = await response.json();
            selectedPost.comments.push(addedComment);
            document.getElementById('commentContent').value = '';
            renderComments(selectedPost.comments);
        } catch (error) {
            console.error(error);
            alert('댓글 추가 중 오류가 발생했습니다.');
        }
    });

    

    // boardDetail post delete Startpoint
    // TODO: 게시글 삭제 시 삭제 확인 모달창을 통해 사용자가 확인할 수 있도록 하는 인터페이스 추가
    boardDeleteButton.addEventListener('click', async () => {
        if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            try {
                const response = await fetch(`/api/posts/${postId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || '게시글 삭제에 실패했습니다.');
                }
                alert('게시글이 삭제되었습니다.');
                window.location.href = '/board';
            } catch (error) {
                console.error(error);
                alert(error.message || '게시글 삭제 중 오류가 발생했습니다.');
            }
        }
    });

    // boardDetail comments delete Startpoint
    window.deleteComment = async commentId => {
        if (confirm('댓글을 삭제하시겠습니까?')) {
            try {
                const response = await fetch(
                    `/api/posts/${postId}/comments/${commentId}`,
                    {
                        method: 'DELETE',
                        credentials: 'include',
                    },
                );
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || '댓글 삭제에 실패했습니다.');
                }
                selectedPost.comments = selectedPost.comments.filter(
                    comment => comment.id !== commentId,
                );
                renderComments(selectedPost.comments, currentUserNickname);
            } catch (error) {
                console.error(error);
                alert(error.message || '댓글 삭제 중 오류가 발생했습니다.');
            }
        }
    };

    // boardDetail comments edit Startpoint
    // TODO: 댓글 수정 시 프롬프트 입력이 아닌 댓글 입력창을 통해 수정할 수 있도록 하는 인터페이스 추가
    // TODO: 댓글 삭제 시 삭제 확인 모달창을 통해 사용자가 확인할 수 있도록 하는 인터페이스 추가
    window.editComment = async commentId => {
        const comment = selectedPost.comments.find(
            comment => comment.id === commentId,
        );
        if (!comment) {
            alert('댓글을 찾을 수 없습니다.');
            return;
        }

        const newContent = prompt('댓글을 수정하세요:', comment.content);
        if (newContent === null || newContent.trim() === '') {
            alert('댓글 내용은 필수입니다.');
            return;
        }

        try {
            const response = await fetch(
                `/api/posts/${postId}/comments/${commentId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ content: newContent }),
                },
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '댓글 수정에 실패했습니다.');
            }
            const updatedComment = await response.json();
            comment.content = updatedComment.content;
            renderComments(selectedPost.comments, currentUserNickname);
        } catch (error) {
            console.error(error);
            alert(error.message || '댓글 수정 중 오류가 발생했습니다.');
        }
    };


    
});

// 게시글 정보 표시 함수
function displayPost(post, currentUserNickname) {
    document.getElementById('postTitle').innerText = post.title;
    document.getElementById('postAuthor').innerText = `작성자: ${post.author}`;
    document.getElementById('postDate').innerText = `작성일: ${post.date}`;
    document.getElementById('postContent').innerHTML = post.content;
    document.getElementById('likeCount').innerText = post.likes;
    document.getElementById('commentsCount').innerText = post.comments.length;
    document.getElementById('viewsCount').innerText = post.views;

    // 이미지 표시
    if (post.image) {
        const postImage = document.createElement('img');
        postImage.src = post.image;
        postImage.alt = '게시글 이미지';
        postImage.style.maxWidth = '100%';
        postImage.style.marginTop = '30px';
        document.getElementById('postContent').appendChild(postImage);
    }

    // 현재 사용자가 작성자인 경우 게시글 수정 및 삭제 버튼 표시
    if (post.author === currentUserNickname) {
        document.getElementById('editButton').style.display = 'inline-block';
        document.getElementById('deleteButton').style.display = 'inline-block';
    }

    // 댓글 렌더링
    renderComments(post.comments, currentUserNickname);
}

// 댓글 렌더링 함수 (Document Fragment 사용)
function renderComments(comments, currentUserNickname) {
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '';

    const fragment = document.createDocumentFragment();

    comments.forEach(comment => {
        const commentItem = document.createElement('div');
        commentItem.classList.add('comment-item');

        const commentContent = document.createElement('div');
        commentContent.classList.add('comment-content');
        commentContent.textContent = comment.content;

        const commentMeta = document.createElement('div');
        commentMeta.classList.add('comment-meta');

        // 작성자와 작성일자를 왼쪽에 배치
        const metaLeft = document.createElement('div');
        metaLeft.classList.add('meta-left');

        const authorSpan = document.createElement('span');
        authorSpan.textContent = comment.author;

        const dateSpan = document.createElement('span');
        dateSpan.textContent = comment.date;

        metaLeft.appendChild(authorSpan);
        metaLeft.appendChild(dateSpan);

        // 수정 및 삭제 버튼을 오른쪽에 배치
        const metaRight = document.createElement('div');
        metaRight.classList.add('meta-right');

        // 현재 사용자가 작성자인 경우 댓글 수정 및 삭제 버튼 추가
        if (comment.author === currentUserNickname) {
            const editButton = document.createElement('button');
            editButton.classList.add('small', 'simple');
            editButton.textContent = '수정';
            editButton.addEventListener('click', () => editComment(comment.id));

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('small', 'simple');
            deleteButton.textContent = '삭제';
            deleteButton.addEventListener('click', () =>
                deleteComment(comment.id),
            );

            metaRight.appendChild(editButton);
            metaRight.appendChild(deleteButton);
        }

        commentMeta.appendChild(metaLeft);
        commentMeta.appendChild(metaRight);

        commentItem.appendChild(commentMeta);
        commentItem.appendChild(commentContent);

        fragment.appendChild(commentItem);
    });

    commentsList.appendChild(fragment);
}

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
