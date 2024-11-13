// /src/js/boardWrite.js

// TODO: 
// 화면 상단 뒤로가기 버튼 이벤트 리스너 추가 
// 화면 상단 프로필 버튼 이벤트 리스너 추가
// boardWriteButton 버튼 클릭 시 /board(게시글 목록 조회) 페이지로 이동하는 이벤트 리스너 추가
// 이미지 파일 선택을 통해 이미지 미리보기가 출력되도록 하는 이벤트 리스너 추가


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


document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("postImage").addEventListener("change", function(event) {
        const file = event.target.files[0];
        const postImagePreview = document.getElementById("postImagePreview");

        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                postImagePreview.src = e.target.result;
                postImagePreview.style.display = "block";
                postImagePreview.style.margin = "10px auto 0";
            };
            reader.readAsDataURL(file);
        } else {
            postImagePreview.style.display = "none";
            postImagePreview.src = "";
        }
    });
});



function dropdownOptions(event) {
    event.stopPropagation();
    const options = document.getElementById('profileOptions');
    options.style.display = options.style.display === 'none' ? 'block' : 'none';

    // 다른 곳을 클릭하면 옵션 메뉴가 닫히도록 이벤트 리스너 추가
    document.addEventListener('click', function closeOptions(e) {
        if (!e.target.closest('.profile-container')) {
            options.style.display = 'none';
            document.removeEventListener('click', closeOptions);
        }
    });
}