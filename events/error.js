import { setTimeout } from 'node:timers/promises';
import { exec } from '../admin/admin_function.js';

export const name = 'error';
export async function listener() {
    console.error('클라이언트 에러 발생:', err);
    await setTimeout(30000); // 30초 대기
    await exec('npm restart'); // 재시작
}
