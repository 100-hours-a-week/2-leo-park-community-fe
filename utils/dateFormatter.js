// /frontend/utils/dateFormatter.js

/**
 * 날짜를 지정된 형식으로 변환하는 함수
 * @param {Date | string | null} date - 변환할 날짜 객체, 문자열, 또는 null 값
 * @param {string} locale - 로케일 설정 (기본값: 'ko-KR')
 * @returns {string} 변환된 날짜 문자열
 */
export const formatDate = (date = new Date(), locale = 'ko-KR') => {
  // 입력값이 null인 경우: 댓글 없음 등 상황에 따라 기본 메시지 제공
  if (date === null) {
    return ''; // 기본값으로 빈 문자열 반환 (필요 시 메시지 반환 가능)
  }

  // 문자열이면 Date 객체로 변환
  const parsedDate = typeof date === 'string' ? new Date(date) : date;

  // 유효하지 않은 Date 객체인지 확인
  if (isNaN(parsedDate)) {
    console.error('Invalid date:', date);
    return '유효하지 않은 날짜';
  }

  return parsedDate.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};