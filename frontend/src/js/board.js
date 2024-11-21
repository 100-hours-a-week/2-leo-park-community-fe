// /src/js/board.js

document.addEventListener("DOMContentLoaded", () => {
    const nicknameEditButton = document.getElementById("nicknameEditButton");
    const passwordEditButton = document.getElementById("passwordEditButton");
    const logoutButton = document.getElementById("logoutButton");
    const boardWriteButton = document.getElementById("boardWriteButton");

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

    boardWriteButton.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/boardWrite";
    });

    const profileImage = sessionStorage.getItem("userProfileImage");

    if (profileImage) {
        const boardProfileImage = document.getElementById("boardProfileImage");
        boardProfileImage.src = profileImage;
    }

    // 프로필 이미지를 클릭하면 dropdownOptions() 함수 실행
    const boardProfileImage = document.getElementById("boardProfileImage");
    boardProfileImage.addEventListener("click", dropdownOptions);

    // 게시글 데이터 로드
    loadPosts();

});


async function loadPosts() {
    const postsContainer = document.getElementById("postsContainer");

    try {
        // API에서 게시글 데이터 가져오기
        const response = await fetch("/api/posts");
        console.log("응답 상태:", response.status); // debug
        if (!response.ok) {
            throw new Error("게시글 데이터를 불러오지 못했습니다.");
        }

        const posts = await response.json();
        console.log("게시글 데이터:", posts); // debug

        // DocumentFragment 생성
        const fragment = document.createDocumentFragment();

        posts.forEach(post => {
            // 게시글 아이템 생성
            const postItem = document.createElement("div");
            postItem.classList.add("post-item");
            postItem.dataset.postId = post.id;
            postItem.style.cursor = "pointer";

            // 게시글 콘텐츠 생성
            const postContent = document.createElement("div");
            postContent.classList.add("post-content");

            const title = document.createElement("div");
            title.textContent = post.title;

            const metaDateContainer = document.createElement("div");
            metaDateContainer.classList.add("post-meta-date-container");

            const postMeta = document.createElement("div");
            postMeta.classList.add("post-meta");

            // 좋아요, 댓글, 조회수
            const metaItems = [
                { label: "좋아요", count: post.likes },
                { label: "댓글", count: post.comments.length },
                { label: "조회수", count: post.views }
            ];

            metaItems.forEach(item => {
                const metaItem = document.createElement("div");
                metaItem.classList.add("meta-item");

                const spanLabel = document.createElement("span");
                spanLabel.textContent = item.label;

                const spanCount = document.createElement("span");
                spanCount.classList.add("count");
                spanCount.textContent = item.count;

                metaItem.appendChild(spanLabel);
                metaItem.appendChild(spanCount);
                postMeta.appendChild(metaItem);
            });

            const postDate = document.createElement("div");
            postDate.classList.add("post-date");
            postDate.textContent = post.date;

            metaDateContainer.appendChild(postMeta);
            metaDateContainer.appendChild(postDate);

            postContent.appendChild(title);
            postContent.appendChild(metaDateContainer);

            // 게시글 풋터 생성
            const postFooter = document.createElement("div");
            postFooter.classList.add("post-footer");

            const postAuthor = document.createElement("div");
            postAuthor.classList.add("post-author");
            postAuthor.textContent = post.author;

            postFooter.appendChild(postAuthor);

            // 게시글 아이템에 콘텐츠 및 풋터 추가
            postItem.appendChild(postContent);
            postItem.appendChild(postFooter);

            // 클릭 이벤트 추가
            postItem.addEventListener("click", () => {
                window.location.href = `/boardDetail?id=${post.id}`;
            });

            // DocumentFragment에 게시글 아이템 추가
            fragment.appendChild(postItem);
        });

        // 게시글 컨테이너에 한 번에 추가
        postsContainer.appendChild(fragment);
    } catch (error) {
        console.error("게시글 데이터를 가져오는 중 오류 발생:", error);
        postsContainer.innerHTML = `<p>게시글을 불러오는 데 실패했습니다. 다시 시도해주세요.</p>`;
    }
}


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

function logout() {
    // 세션 스토리지에서 로그인 정보 삭제
    sessionStorage.removeItem('userNickname');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userProfileImage');

    // 로그인 페이지로 리디렉션
    window.location.href = '/login';
}