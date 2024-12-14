// frontend/utils/readFileAsBase64.js

export async function readFileAsBase64(file) {
    const reader = new FileReader();

    const result = await new Promise((resolve, reject) => {
        reader.onload = e => resolve(e.target.result); // Base64 문자열 반환
        reader.onerror = reject; // 에러 발생 시 reject
        reader.readAsDataURL(file); // Base64로 읽기
    });

    return result; // 최종 Base64 데이터 반환
}