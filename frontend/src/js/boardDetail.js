// /src/js/boardDetail.js

// TODO: 
// 화면 상단 뒤로가기 버튼 이벤트 리스너 추가 
// 화면 상단 프로필 버튼 이벤트 리스너 추가
// boardWriteButton 버튼 클릭 시 /board(게시글 목록 조회) 페이지로 이동하는 이벤트 리스너 추가
// 이미지 파일 선택을 통해 이미지 미리보기가 출력되도록 하는 이벤트 리스너 추가
// 수정 버튼 클릭 시 /boardEdit(게시글 수정) 페이지로 이동하는 이벤트 리스너 추가


// 수치 형식 지정 함수
const formatCount = (count) => {
    if (count >= 100000) {
        return `${Math.floor(count / 1000)}k`;
    } else if (count >= 10000) {
        return `${Math.floor(count / 1000)}k`;
    } else {
        return count.toString();
    }
};


// HACK: Mock data (replace with actual data retrieval logic)
const posts = [
    {
        id: 1,
        title: "첫 번째 게시글",
        content: "이것은 첫 번째 게시글의 내용입니다.",
        author: "작성자1",
        date: "2024-01-01",
        likes: 10,
        comments: [
            { id: 1, author: "댓글작성자1", content: "첫 번째 댓글입니다.", date: "2024-01-01" },
            { id: 2, author: "댓글작성자2", content: "두 번째 댓글입니다.", date: "2024-01-02" }
        ],
        views: 50
    },
    {
        id: 2,
        title: "두 번째 게시글",
        content: "이것은 두 번째 게시글의 내용입니다.",
        author: "작성자2",
        date: "2024-02-01",
        likes: 5,
        comments: [
            { id: 1, author: "댓글작성자1", content: "첫 번째 댓글입니다.", date: "2024-02-01" }
        ],
        views: 30
    }
];

document.addEventListener("DOMContentLoaded", () => {
    const nicknameEdit = document.getElementById("nicknameEdit");
    const passwordEdit = document.getElementById("passwordEdit");
    const logout = document.getElementById("logout");
    
    // TODO: 게시글 작성 버튼 이벤트 리스너 추가

    const profileImage = sessionStorage.getItem("userProfileImage");
    // 나중에는 서버에 이미지를 저장한 후, 응답으로 이미지 URL을 반환하고 이를 프론트엔드에서 받아서 사용하는 방식으로?

    if (profileImage) {
        const boardProfileImage = document.getElementById("boardProfileImage");
        boardProfileImage.src = profileImage;  
        // profileImage는 세션 스토리지에서 가져온 이미지 URL(단순 문자열)이기 때문에 DOM에서 해당 이미지 요소에 접근할 수 있도록
        // boardProfileImage 변수를 새롭게 선언하여 할당(실제 DOM 요소를 참조하여 화면에 반영)
    }

    // 프로필 이미지를 클릭하면 dropdownOptions() 함수 실행
    const boardProfileImage = document.getElementById("boardProfileImage");
    boardProfileImage.addEventListener("click", dropdownOptions);

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


const currentUser = { nickname: "Author Name" }; // Replace with actual user data

// Display post data in HTML elements
document.getElementById("postTitle").innerText = selectedPost.title;
document.getElementById("postAuthor").innerText = `작성자: ${selectedPost.author}`;
document.getElementById("postDate").innerText = `작성일: ${selectedPost.date}`;
document.getElementById("postContent").innerHTML = selectedPost.content;
document.getElementById("likeCount").innerText = selectedPost.likes;
document.getElementById("commentsCount").innerText = selectedPost.comments.length;
document.getElementById("viewsCount").innerText = selectedPost.views;

// Show edit and delete buttons if the current user is the author
if (selectedPost.author === currentUser?.nickname) {
    document.getElementById("editButton").style.display = "inline";
    document.getElementById("deleteButton").style.display = "inline";
}

// Event listeners
document.getElementById("likeButton").addEventListener("click", () => {
    store.likePost();
    document.getElementById("likeCount").innerText = ++selectedPost.likes;
});

document.getElementById("backToListButton").addEventListener("click", () => {
    store.setState({ currentPage: 'list' });
});

document.getElementById("editButton").addEventListener("click", () => {
    store.setState({ currentPage: 'edit', editMode: true });
});

document.getElementById("deleteButton").addEventListener("click", () => {
    store.deletePost(selectedPost.id);
});

document.getElementById("addCommentButton").addEventListener("click", () => {
    store.addComment();
    renderComments(); // 댓글 추가 후 다시 렌더링
});




// Store object with deleteComment and likePost methods
const store = {
    // 좋아요 수와 조회수 증가
    likePost() {
        const updatedPost = {
            ...this.state.selectedPost,
            likes: (this.state.selectedPost.likes || 0) + 1, // 좋아요 수 증가
            views: (this.state.selectedPost.views || 0) + 1 // 조회수도 증가 (옵션)
        };

        this.setState({
            selectedPost: updatedPost,
            posts: this.state.posts.map(post => post.id === updatedPost.id ? updatedPost : post) // 상태 업데이트
        });

        alert('좋아요가 추가되었습니다!'); // 알림 추가 (선택 사항)
    },
    // 게시글 삭제
    deletePost(postId) {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        const posts = this.state.posts.filter(post => post.id !== id);
        this.setState({
            posts,
            currentPage: 'list'
        });

        alert('게시글이 삭제되었습니다.');
    },
    addComment() {
        const commentContent = document.getElementById("commentContent").value;
        if (commentContent.trim()) {
            selectedPost.comments.push({
                id: Date.now(),
                author: currentUser.nickname,
                date: new Date().toISOString().split('T')[0],
                content: commentContent
            });
            document.getElementById("commentContent").value = ""; // 입력창 초기화
        }
    },
    // 댓글 추가
    addComment() {
        const content = document.getElementById('commentContent').value;
        if (!content) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }

        const newComment = {
            id: new Date().getTime(),
            content,
            author: this.state.currentUser.nickname,
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

        const updatedPost = {
            ...this.state.selectedPost,
            comments: [...(this.state.selectedPost.comments || []), newComment],
            commentsCount: ((this.state.selectedPost.commentsCount || 0) + 1) // 댓글 수 증가
        };

        const posts = this.state.posts.map(post =>
            post.id === updatedPost.id ? updatedPost : post
        );

        this.setState({
            posts,
            selectedPost: updatedPost
        });

        document.getElementById('commentContent').value = '';
    },
    deleteComment(commentId) {
        selectedPost.comments = selectedPost.comments.filter(comment => comment.id !== commentId);
        renderComments(); // 삭제 후 댓글 목록 다시 렌더링
        document.getElementById("commentsCount").innerText = selectedPost.comments.length;
    },
    // 댓글 삭제
    deleteComment(commentId) {
        if (!confirm('댓글을 삭제하시겠습니까?')) return;

        const updatedPost = {
            ...this.state.selectedPost,
            comments: this.state.selectedPost.comments.filter(comment => comment.id !== commentId)
        };

        const posts = this.state.posts.map(post =>
            post.id === updatedPost.id ? updatedPost : post
        );

        this.setState({
            posts,
            selectedPost: updatedPost
        });
    }
};

// Render comments function
function renderComments() {
    const commentsList = document.getElementById("commentsList");
    commentsList.innerHTML = "";
    selectedPost.comments.forEach(comment => {
        const commentItem = document.createElement("div");
        commentItem.classList.add("comment-item");
        commentItem.innerHTML = `
            <div class="comment-content">${comment.content}</div>
            <div class="comment-meta">
                <span>${comment.author}</span>
                <span>${comment.date}</span>
                ${comment.author === currentUser?.nickname ?
                `<button class="small danger" onclick="store.deleteComment(${comment.id})">삭제</button>` : ""}
            </div>
        `;
        commentsList.appendChild(commentItem);
    });
}

// Initial render
renderComments();