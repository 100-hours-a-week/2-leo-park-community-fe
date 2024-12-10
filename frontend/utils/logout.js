// /frontend/utils/logout.js

export async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include',
        });

        const result = await response.json();
        if (!result.error) {
            alert('로그아웃되었습니다.');
            window.location.href = '/login';
        } else {
            alert('로그아웃 중 오류가 발생했습니다.');
        }
    } catch (error) {
        console.error('로그아웃 요청 중 오류 발생:', error);
        alert('로그아웃 중 오류가 발생했습니다.');
    }
}