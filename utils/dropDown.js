// /frontend/utils/dropDown.js

export function dropdownOptions(event, imageSelector, optionsSelector) {
    event.stopPropagation();
    const options = document.querySelector(optionsSelector);
    options.style.display = options.style.display === 'none' ? 'block' : 'none';

    // 다른 곳을 클릭하면 옵션 메뉴가 닫히도록 이벤트 리스너 추가
    document.addEventListener('click', function closeOptions(e) {
        if (
            !e.target.closest(optionsSelector) &&
            !e.target.closest(imageSelector)
        ) {
            options.style.display = 'none';
            document.removeEventListener('click', closeOptions);
        }
    });
}