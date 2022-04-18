import { sendAdmin } from '../admin/bot_message.js';
import { startNotice, startUpdate, startTest, startTestPatch, startUrus } from '../admin/maple_auto_notice.js';
import { NOTICE_CHANNEL_ID } from '../soyabot_config.js';

export const name = 'ready';
export function listener(client) {
    if (client.channels.cache.has(NOTICE_CHANNEL_ID)) {
        // 공지용 채널이 존재하는 클라이언트에서 공지 기능 활성화
        startNotice(client); // 공지 자동 알림 기능
        startUpdate(client); // 업데이트 자동 알림 기능
        startTest(client); // 테섭 자동 알림 기능
        startTestPatch(client); // 테섭 패치 감지 기능
        startUrus(client); // 우르스 2배 종료 30분 전 알림
    }

    sendAdmin(client.users, `${client.shard.ids[0]}번째 샤드에서 ${client.user.tag}이 작동 중입니다.`);
}
