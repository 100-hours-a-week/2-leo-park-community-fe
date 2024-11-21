// /src/js/boardDetail.js

document.addEventListener("DOMContentLoaded", async () => {
    const nicknameEditButton = document.getElementById("nicknameEditButton");
    const passwordEditButton = document.getElementById("passwordEditButton");
    const logoutButton = document.getElementById("logoutButton");
    const backButton = document.getElementById("backButton");
    const editButton = document.getElementById("editButton");
    const deleteButton = document.getElementById("deleteButton");
    const likeButton = document.getElementById("likeButton");
    const addCommentButton = document.getElementById("addCommentButton");

    // 이벤트 리스너 설정
    nicknameEditButton.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/nicknameEdit";
    });

    passwordEditButton.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/passwordEdit";
    });

    logoutButton.addEventListener("click", (e) => {
        e.preventDefault();
        logout();
    });

    backButton.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/board";
    });

    // 프로필 이미지 표시
    const profileImage = sessionStorage.getItem("userProfileImage");
    if (profileImage) {
        const boardProfileImage = document.getElementById("boardProfileImage");
        boardProfileImage.src = profileImage;
    }

    // 프로필 이미지를 클릭하면 dropdownOptions() 함수 실행
    const boardProfileImage = document.getElementById("boardProfileImage");
    boardProfileImage.addEventListener("click", dropdownOptions);

    // 현재 로그인한 사용자 닉네임 가져오기
    // HACK: sessionStorage에 일단 저장된 userNickname이 없을 경우 "Anybody"로 대체
    // NOTE: 나중에 게시글하고 댓글 수정 및 삭제할 때 작성자와 시도자가 같은지를 서버에서 검토하기 때문에 currentUserNickname을 요청 헤더에 포함시켜야하는데 
    // 요청 헤더는 아스키 코드 말고 한글 같은 유니코드가 포함되니까 오류가 발생했음("익명"이라고 명시된 부분이 있으면 모두 "Anybody"로 수정!)
    const currentUserNickname = sessionStorage.getItem('userNickname') || 'Anybody';

    // URL에서 게시글 ID 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    let selectedPost = null;

    // 게시글 데이터 가져오기
    try {
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) {
            throw new Error('게시글을 가져오는 데 실패했습니다.');
        }
        selectedPost = await response.json();

        // 조회수 증가
        await fetch(`/api/posts/${postId}/views`, { method: 'POST' });

        // 게시글 정보 표시
        displayPost(selectedPost);
    } catch (error) {
        console.error(error);
        alert('게시글을 불러오는 중 오류가 발생했습니다.');
    }


    // NOTE: 좋아요수 증가 데이터를 동적으로 렌더링하기 위해서 일단 추가
    likeButton.addEventListener("click", async () => {
        try {
            await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
            selectedPost.likes += 1;
            document.getElementById("likeCount").innerText = selectedPost.likes;
        } catch (error) {
            console.error(error);
            alert('좋아요 처리 중 오류가 발생했습니다.');
        }
    });

    addCommentButton.addEventListener("click", async () => {
        const commentContent = document.getElementById("commentContent").value.trim();
        if (!commentContent) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }

        const newComment = {
            content: commentContent,
            author: currentUserNickname,
            date: new Date().toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            })
        };

        try {
            const response = await fetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newComment)
            });
            if (!response.ok) {
                throw new Error('댓글 추가에 실패했습니다.');
            }
            const addedComment = await response.json();
            selectedPost.comments.push(addedComment);
            document.getElementById("commentContent").value = '';
            renderComments(selectedPost.comments);
        } catch (error) {
            console.error(error);
            alert('댓글 추가 중 오류가 발생했습니다.');
        }
    });

    // 게시글 수정 버튼 클릭 시 수정 페이지로 이동
    editButton.addEventListener("click", () => {
        window.location.href = `/boardEdit?id=${postId}`;
    });

    // 삭제 버튼 클릭 시 게시글 삭제
    // TODO: 게시글 삭제 시 삭제 확인 모달창을 통해 사용자가 확인할 수 있도록 하는 인터페이스 추가
    deleteButton.addEventListener("click", async () => {
        if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            try {
                const response = await fetch(`/api/posts/${postId}`, {
                    method: 'DELETE',
                    headers: {
                        'user-nickname': currentUserNickname // 백엔드 쪽에서 작성자와 게시글 삭제 시도자가 동일한지를 확인하기 때문에 요청 헤더에 포함
                    }
                });
                if (!response.ok) {
                    throw new Error('게시글 삭제에 실패했습니다.');
                }
                alert('게시글이 삭제되었습니다.');
                window.location.href = '/board';
            } catch (error) {
                console.error(error);
                alert('게시글 삭제 중 오류가 발생했습니다.');
            }
        }
    });

    // 댓글 삭제 함수
    window.deleteComment = async (commentId) => {
        if (confirm('댓글을 삭제하시겠습니까?')) {
            try {
                const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
                    method: 'DELETE',
                    headers: {
                        'user-nickname': currentUserNickname // 백엔드 쪽에서 작성자와 댓글 삭제 시도자가 동일한지를 확인하기 때문에 요청 헤더에 포함
                    }
                });
                if (!response.ok) {
                    throw new Error('댓글 삭제에 실패했습니다.');
                }
                selectedPost.comments = selectedPost.comments.filter(comment => comment.id !== commentId);
                renderComments(selectedPost.comments);
            } catch (error) {
                console.error(error);
                alert('댓글 삭제 중 오류가 발생했습니다.');
            }
        }
    };

    // 댓글 수정 함수 추가
    // TODO: 댓글 수정 시 프롬프트 입력이 아닌 댓글 입력창을 통해 수정할 수 있도록 하는 인터페이스 추가
    // TODO: 댓글 삭제 시 삭제 확인 모달창을 통해 사용자가 확인할 수 있도록 하는 인터페이스 추가
    window.editComment = async (commentId) => {
        const comment = selectedPost.comments.find(comment => comment.id === commentId);
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
            const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'user-nickname': currentUserNickname // 백엔드 쪽에서 작성자와 댓글 수정 시도자가 동일한지를 확인하기 때문에 요청 헤더에 포함 
                },
                body: JSON.stringify({ content: newContent })
            });
            if (!response.ok) {
                throw new Error('댓글 수정에 실패했습니다.');
            }
            const updatedComment = await response.json();
            comment.content = updatedComment.content;
            renderComments(selectedPost.comments);
        } catch (error) {
            console.error(error);
            alert('댓글 수정 중 오류가 발생했습니다.');
        }
    };
});

// 게시글 정보 표시 함수
function displayPost(post) {
    document.getElementById("postTitle").innerText = post.title;
    document.getElementById("postAuthor").innerText = `작성자: ${post.author}`;
    document.getElementById("postDate").innerText = `작성일: ${post.date}`;
    document.getElementById("postContent").innerHTML = post.content;
    document.getElementById("likeCount").innerText = post.likes;
    document.getElementById("commentsCount").innerText = post.comments.length;
    document.getElementById("viewsCount").innerText = post.views;

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
    const currentUserNickname = sessionStorage.getItem('userNickname') || 'Anybody';
    if (post.author === currentUserNickname) {
        document.getElementById("editButton").style.display = "inline-block";
        document.getElementById("deleteButton").style.display = "inline-block";
    }

    // 댓글 렌더링
    renderComments(post.comments);
}

// 댓글 렌더링 함수 (Document Fragment 사용)
function renderComments(comments) {
    const commentsList = document.getElementById("commentsList");
    commentsList.innerHTML = "";

    const fragment = document.createDocumentFragment();

    comments.forEach(comment => {
        const commentItem = document.createElement("div");
        commentItem.classList.add("comment-item");

        const commentContent = document.createElement("div");
        commentContent.classList.add("comment-content");
        commentContent.textContent = comment.content;

        const commentMeta = document.createElement("div");
        commentMeta.classList.add("comment-meta");

        // 작성자와 작성일자를 왼쪽에 배치
        const metaLeft = document.createElement("div");
        metaLeft.classList.add("meta-left");

        const authorSpan = document.createElement("span");
        authorSpan.textContent = comment.author;

        const dateSpan = document.createElement("span");
        dateSpan.textContent = comment.date;

        metaLeft.appendChild(authorSpan);
        metaLeft.appendChild(dateSpan);

        // 수정 및 삭제 버튼을 오른쪽에 배치
        const metaRight = document.createElement("div");
        metaRight.classList.add("meta-right");

        // 현재 사용자가 작성자인 경우 댓글 수정 및 삭제 버튼 추가
        const currentUserNickname = sessionStorage.getItem('userNickname') || 'Anybody'
        if (comment.author === currentUserNickname) {

            const editButton = document.createElement("button");
            editButton.classList.add("small", "simple");
            editButton.textContent = "수정";
            editButton.addEventListener("click", () => editComment(comment.id));

            const deleteButton = document.createElement("button");
            deleteButton.classList.add("small", "simple");
            deleteButton.textContent = "삭제";
            deleteButton.addEventListener("click", () => deleteComment(comment.id));

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
        if (!e.target.closest('#profileOptions') && !e.target.closest('#boardProfileImage')) {
            options.style.display = 'none';
            document.removeEventListener('click', closeOptions);
        }
    });
}