import { sendAdmin } from '../admin/bot_message.js';
import {
    startNotice,
    startUpdate,
    startTest,
    startTestPatch,
    startCulvert,
    startFlag
} from '../admin/maple_auto_notice.js';
import { HOMEPAGE_NOTICE_CHANNEL_ID, CONTENTS_NOTICE_CHANNEL_ID } from '../soyabot_config.js';

export const name = 'ready';
export function listener(client) {
    // 공지용 채널이 존재하는 클라이언트에서 공지 기능 활성화
    if (client.channels.cache.has(HOMEPAGE_NOTICE_CHANNEL_ID)) {
        startNotice(client, HOMEPAGE_NOTICE_CHANNEL_ID); // 공지 자동 알림 기능
        startUpdate(client, HOMEPAGE_NOTICE_CHANNEL_ID); // 업데이트 자동 알림 기능
        startTest(client, HOMEPAGE_NOTICE_CHANNEL_ID); // 테섭 자동 알림 기능
        startTestPatch(client, HOMEPAGE_NOTICE_CHANNEL_ID); // 테섭 패치 감지 기능
    }
    if (client.channels.cache.has(CONTENTS_NOTICE_CHANNEL_ID)) {
        startCulvert(client, CONTENTS_NOTICE_CHANNEL_ID); // 지하 수로 입장 마감 30분 전 알림
        startFlag(client, CONTENTS_NOTICE_CHANNEL_ID); // 플래그 레이스 입장 마감 30분 전 알림
    }

    sendAdmin(client.users, `${client.shard.ids[0]}번째 샤드에서 ${client.user.tag}이 작동 중입니다.`);
}
