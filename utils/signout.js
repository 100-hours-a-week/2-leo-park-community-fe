// frontend/utils/signout.js

export async function signout() {
    if (confirm('정말로 계정을 삭제하시겠습니까?')) {
        try {
            const response = await fetch('/api/users/delete', {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                alert('계정이 삭제되었습니다.');
                window.location.href = '/login';
            } else {
                const errorData = await response.json();
                alert(errorData.message || '계정 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('계정 삭제 요청 중 오류 발생:', error);
            alert('계정 삭제 중 문제가 발생했습니다. 다시 시도해주세요.');
        }
    }
}