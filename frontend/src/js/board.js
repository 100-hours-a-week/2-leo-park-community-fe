// /src/js/board.js

document.addEventListener('DOMContentLoaded', () => {
    const nicknameEditButton = document.getElementById('nicknameEditButton');
    const passwordEditButton = document.getElementById('passwordEditButton');
    const logoutButton = document.getElementById('logoutButton');
    const boardWriteButton = document.getElementById('boardWriteButton');

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

    boardWriteButton.addEventListener('click', e => {
        e.preventDefault();
        window.location.href = '/boardWrite';
    });

    // 게시글 목록조회 페이지 로드 시 서버로부터 사용자 정보 인가(login Success Startpoint)
    fetch('/api/user/profile', {
        method: 'GET',
        credentials: 'include', // 세션 쿠키를 포함하여 전송
    })
        .then(response => {
            if (response.status === 401) {
                // 인증되지 않은 경우 로그인 페이지로 리디렉션
                alert('로그인이 필요합니다.');
                window.location.href = '/login';
                return;
            }
            return response.json();
        })
        .then(user => {
            if (user) {
                // 사용자 정보를 사용하여 페이지에 표시
                const boardProfileImage = document.getElementById('boardProfileImage');
                if (user.profileImage) {
                    boardProfileImage.src = user.profileImage;
                } else {
                    boardProfileImage.src = '/public/images/default-profile.png';
                }

                // 프로필 이미지를 클릭하면 dropdownOptions() 함수 실행
                boardProfileImage.addEventListener('click', dropdownOptions);
            }
        })
        .catch(error => {
            console.error('사용자 정보 가져오기 중 오류 발생:', error);
            alert('사용자 정보를 불러오는 데 실패했습니다. 다시 시도해주세요.');
            window.location.href = '/login';
        });

    // 게시글 데이터 로드
    loadPosts();
});

async function loadPosts() {
    const postsContainer = document.getElementById('postsContainer');

    try {
        // board Startpoint
        const response = await fetch('/api/posts');
        console.log('응답 상태:', response.status); // debug
        if (!response.ok) {
            throw new Error('게시글 데이터를 불러오지 못했습니다.');
        }

        const posts = await response.json();
        console.log('게시글 데이터:', posts); // debug

        // DocumentFragment 생성
        const fragment = document.createDocumentFragment();

        posts.forEach(post => {
            // 게시글 아이템 생성
            const postItem = document.createElement('div');
            postItem.classList.add('post-item');
            postItem.dataset.postId = post.id;
            postItem.style.cursor = 'pointer';

            // 게시글 콘텐츠 생성
            const postContent = document.createElement('div');
            postContent.classList.add('post-content');

            const title = document.createElement('div');
            title.textContent = post.title;

            const metaDateContainer = document.createElement('div');
            metaDateContainer.classList.add('post-meta-date-container');

            const postMeta = document.createElement('div');
            postMeta.classList.add('post-meta');

            // 좋아요, 댓글, 조회수
            const metaItems = [
                { label: '좋아요', count: post.likes },
                { label: '댓글', count: post.comments.length },
                { label: '조회수', count: post.views },
            ];

            metaItems.forEach(item => {
                const metaItem = document.createElement('div');
                metaItem.classList.add('meta-item');

                const spanLabel = document.createElement('span');
                spanLabel.textContent = item.label;

                const spanCount = document.createElement('span');
                spanCount.classList.add('count');
                spanCount.textContent = item.count;

                metaItem.appendChild(spanLabel);
                metaItem.appendChild(spanCount);
                postMeta.appendChild(metaItem);
            });

            const postDate = document.createElement('div');
            postDate.classList.add('post-date');
            postDate.textContent = post.date;

            metaDateContainer.appendChild(postMeta);
            metaDateContainer.appendChild(postDate);

            postContent.appendChild(title);
            postContent.appendChild(metaDateContainer);

            // 게시글 풋터 생성
            const postFooter = document.createElement('div');
            postFooter.classList.add('post-footer');

            const postAuthor = document.createElement('div');
            postAuthor.classList.add('post-author');
            postAuthor.textContent = post.author;

            postFooter.appendChild(postAuthor);

            // 게시글 아이템에 콘텐츠 및 풋터 추가
            postItem.appendChild(postContent);
            postItem.appendChild(postFooter);

            // 클릭 이벤트 추가
            postItem.addEventListener('click', () => {
                window.location.href = `/boardDetail?id=${post.id}`;
            });

            // DocumentFragment에 게시글 아이템 추가
            fragment.appendChild(postItem);
        });

        // 게시글 컨테이너에 한 번에 추가
        postsContainer.appendChild(fragment);
    } catch (error) {
        console.error('게시글 데이터를 가져오는 중 오류 발생:', error);
        postsContainer.innerHTML = `<p>게시글을 불러오는 데 실패했습니다. 다시 시도해주세요.</p>`;
    }
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


