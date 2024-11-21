// /src/js/nicknameEdit.js

document.addEventListener('DOMContentLoaded', () => {
    const nicknameEdit = document.getElementById('nicknameEdit');
    const passwordEdit = document.getElementById('passwordEdit');
    const logout = document.getElementById('logout');

    // TODO: 게시글 작성 버튼 이벤트 리스너 추가

    const profileImage = sessionStorage.getItem('userProfileImage');
    // 나중에는 서버에 이미지를 저장한 후, 응답으로 이미지 URL을 반환하고 이를 프론트엔드에서 받아서 사용하는 방식으로?

    if (profileImage) {
        const boardProfileImage = document.getElementById('boardProfileImage');
        boardProfileImage.src = profileImage;
        // profileImage는 세션 스토리지에서 가져온 이미지 URL(단순 문자열)이기 때문에 DOM에서 해당 이미지 요소에 접근할 수 있도록
        // boardProfileImage 변수를 새롭게 선언하여 할당(실제 DOM 요소를 참조하여 화면에 반영)
    }

    // 프로필 이미지를 클릭하면 dropdownOptions() 함수 실행
    const boardProfileImage = document.getElementById('boardProfileImage');
    boardProfileImage.addEventListener('click', dropdownOptions);

    registerButton.addEventListener('click', e => {
        e.preventDefault();
        handleRegister();
    });

    loginButton.addEventListener('click', e => {
        e.preventDefault();
        window.location.href = '/login';
    });

    // 프로필 이미지 프리뷰 영역을 클릭하면 파일 입력 창이 열리도록 이벤트 리스너 추가
    imagePreview.addEventListener('click', () => {
        registerProfileImage.click();
    });

    // 파일 선택 시 이미지 미리보기 업데이트
    registerProfileImage.addEventListener('change', event => {
        handleImagePreview(event, previewImage);
    });

    backButton.addEventListener('click', e => {
        e.preventDefault();
        window.location.href = '/login';
    });
});

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
