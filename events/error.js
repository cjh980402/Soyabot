export const name = 'error';
export function listener(err) {
    console.error('클라이언트 에러 발생:', err);
}
