import { EmbedBuilder } from 'discord.js';
import { request } from 'undici';
import { load } from 'cheerio';
import { sendBotNotice, sendAdmin } from './bot_message.js';
let noticeTimer = null;
let updateTimer = null;
let testTimer = null;
let testPatchTimer = null;
let urusTimer = null;
let flagTimer = null;
let culvertTimer = null;

export function startNotice(client, target) {
    noticeTimer ??= setInterval(async () => {
        try {
            const { body } = await request('https://maplestory.nexon.com/News/Notice');
            const data = load(await body.text())('.news_board li > p');

            const notice = [];
            for (let i = 0; i < data.length; i++) {
                const title = data.eq(i).text().trim();
                const url = `https://maplestory.nexon.com${data.eq(i).find('a').attr('href')}`;
                const number = +/\d+$/.exec(url);
                const existing = client.db.get(
                    'SELECT * FROM maple_notice WHERE title = ? AND notice_number = ?',
                    title,
                    number
                ); // 제목과 번호로 검색을 하므로 검색되지 않은 공지는 전송대상

                if (!existing) {
                    client.db.insert('maple_notice', { title, url, notice_number: number }); // 중복방지 위해 db에 삽입
                    notice.push(`${data.eq(i).find('img').attr('alt')} [${title}](${url})`);
                }
            }

            if (notice.length > 0) {
                const noticeEmbed = new EmbedBuilder()
                    .setTitle('**메이플 공지사항**')
                    .setColor('#FF9999')
                    .setDescription(notice.join('\n\n'))
                    .setTimestamp();

                sendBotNotice(client, noticeEmbed, target);
            }
        } catch (err) {
            sendAdmin(client.users, `자동알림(공지) 파싱 중 에러 발생\n에러 내용: ${err.stack}`);
        }
    }, 127000);
}

export function stopNotice() {
    if (noticeTimer) {
        clearInterval(noticeTimer);
        noticeTimer = null;
    }
}

export function startUpdate(client, target) {
    updateTimer ??= setInterval(async () => {
        try {
            const { body } = await request('https://maplestory.nexon.com/News/Update');
            const data = load(await body.text())('.update_board li > p');

            const update = [];
            for (let i = 0; i < data.length; i++) {
                const title = data.eq(i).text().trim();
                const url = `https://maplestory.nexon.com${data.eq(i).find('a').attr('href')}`;
                const number = +/\d+$/.exec(url);
                const existing = client.db.get(
                    'SELECT * FROM maple_update WHERE title = ? AND notice_number = ?',
                    title,
                    number
                ); // 제목과 번호로 검색을 하므로 검색되지 않은 공지는 전송대상

                if (!existing) {
                    client.db.insert('maple_update', { title, url, notice_number: number }); // 중복방지 위해 db에 삽입
                    update.push(`[패치] [${title}](${url})`);
                }
            }

            if (update.length > 0) {
                const noticeEmbed = new EmbedBuilder()
                    .setTitle('**메이플 업데이트**')
                    .setColor('#FF9999')
                    .setDescription(update.join('\n\n'))
                    .setTimestamp();

                sendBotNotice(client, noticeEmbed, target);
            }
        } catch (err) {
            sendAdmin(client.users, `자동알림(업데이트) 파싱 중 에러 발생\n에러 내용: ${err.stack}`);
        }
    }, 131000);
}

export function stopUpdate() {
    if (updateTimer) {
        clearInterval(updateTimer);
        updateTimer = null;
    }
}

export function startTest(client, target) {
    testTimer ??= setInterval(async () => {
        try {
            const { body } = await request('https://maplestory.nexon.com/Testworld/News/All');
            const data = load(await body.text())('.news_board li > p');

            const test = [];
            for (let i = 0; i < data.length; i++) {
                const title = data.eq(i).text().trim();
                const url = `https://maplestory.nexon.com${data.eq(i).find('a').attr('href')}`;
                const number = +/\d+$/.exec(url);
                const existing = client.db.get(
                    'SELECT * FROM maple_test WHERE title = ? AND notice_number = ?',
                    title,
                    number
                ); // 제목과 번호로 검색을 하므로 검색되지 않은 공지는 전송대상

                if (!existing) {
                    client.db.insert('maple_test', { title, url, notice_number: number }); // 중복방지 위해 db에 삽입
                    const picurl = data.eq(i).find('img').attr('src');
                    const type = picurl.endsWith('1.png')
                        ? '[공지]'
                        : picurl.endsWith('2.png')
                        ? '[GM]'
                        : picurl.endsWith('3.png')
                        ? '[점검]'
                        : '[패치]';
                    test.push(`${type} [${title}](${url})`);
                }
            }

            if (test.length > 0) {
                const noticeEmbed = new EmbedBuilder()
                    .setTitle('**메이플 테스트월드 공지**')
                    .setColor('#FF9999')
                    .setDescription(test.join('\n\n'))
                    .setTimestamp();

                sendBotNotice(client, noticeEmbed, target);
            }
        } catch (err) {
            sendAdmin(client.users, `자동알림(테섭) 파싱 중 에러 발생\n에러 내용: ${err.stack}`);
        }
    }, 137000);
}

export function stopTest() {
    if (testTimer) {
        clearInterval(testTimer);
        testTimer = null;
    }
}

export function startTestPatch(client, target) {
    testPatchTimer ??= setInterval(async () => {
        try {
            const lastPatch = client.db.get('SELECT * FROM test_patch ORDER BY version DESC LIMIT 1');
            const patchVersion = (lastPatch?.version ?? 164) + 1; // 새로 가져올 패치의 버전
            const patchURL = `http://maplestory.dn.nexoncdn.co.kr/PatchT/01${patchVersion}/01${
                patchVersion - 1
            }to01${patchVersion}.patch`;

            const { headers } = await request(patchURL, { method: 'HEAD' }); // 헤더 정보만 받아옴
            if (headers['content-type'] === 'application/octet-stream') {
                // 파일이 감지된 경우
                const fileSize = +headers['content-length'] / 1024 / 1024;
                client.db.insert('test_patch', { version: patchVersion, url: patchURL });
                sendBotNotice(
                    client,
                    `[Tver 1.2.${patchVersion}]\n테스트월드 패치 파일이 발견되었습니다.\n파일 크기: ${fileSize.toFixed(
                        2
                    )}MB\n패치파일 주소: ${patchURL}`,
                    target
                );
            }
        } catch (err) {
            sendAdmin(client.users, `자동알림(테섭파일) 파싱 중 에러 발생\n에러 내용: ${err.stack}`);
        }
    }, 139000);
}

export function stopTestPatch() {
    if (testPatchTimer) {
        clearInterval(testPatchTimer);
        testPatchTimer = null;
    }
}

export function startUrus(client, target) {
    const now = new Date();
    const urusDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22, 30);
    if (now > urusDate) {
        urusDate.setDate(urusDate.getDate() + 1); // 우르스 알림 시간 지났으면 다음 날로 알림 설정
    }
    urusTimer ??= setTimeout(() => {
        sendBotNotice(client, '우르스 메소 2배 종료까지 30분 남았습니다!', target);
        // setInterval은 즉시 수행은 안되므로 1번 공지를 내보내고 setInterval을 한다
        urusTimer = setInterval(sendBotNotice, 86400000, client, '우르스 메소 2배 종료까지 30분 남았습니다!', target); // 24시간 주기
    }, urusDate - now);
}

export function stopUrus() {
    if (urusTimer) {
        clearInterval(urusTimer); // clearInterval과 clearTimeout은 동일한 동작 수행
        urusTimer = null;
    }
}

export function startCulvert(client, target) {
    const now = new Date();
    const culvertDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22, 30);
    culvertDate.setDate(culvertDate.getDate() - culvertDate.getDay()); // 날짜를 같은 주 일요일로 변경
    if (now > culvertDate) {
        culvertDate.setDate(culvertDate.getDate() + 7); // 수로 알림 시간 지났으면 다음 주로 알림 설정
    }
    culvertTimer ??= setTimeout(() => {
        sendBotNotice(client, '지하 수로 입장 마감까지 30분 남았습니다!', target);
        // setInterval은 즉시 수행은 안되므로 1번 공지를 내보내고 setInterval을 한다
        culvertTimer = setInterval(
            sendBotNotice,
            604800000,
            client,
            '지하 수로 입장 마감까지 30분 남았습니다!',
            target
        ); // 일주일 주기
    }, culvertDate - now);
}

export function stopCulvert() {
    if (culvertTimer) {
        clearInterval(culvertTimer); // clearInterval과 clearTimeout은 동일한 동작 수행
        culvertTimer = null;
    }
}

export function startFlag(client, target) {
    const now = new Date();
    const flagDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 0);
    flagDate.setDate(flagDate.getDate() - flagDate.getDay()); // 날짜를 같은 주 일요일로 변경
    if (now > flagDate) {
        flagDate.setDate(flagDate.getDate() + 7); // 플래그 알림 시간 지났으면 다음 주로 알림 설정
    }
    flagTimer ??= setTimeout(() => {
        sendBotNotice(client, '플래그 레이스 입장 마감까지 30분 남았습니다!', target);
        // setInterval은 즉시 수행은 안되므로 1번 공지를 내보내고 setInterval을 한다
        flagTimer = setInterval(
            sendBotNotice,
            604800000,
            client,
            '플래그 레이스 입장 마감까지 30분 남았습니다!',
            target
        ); // 일주일 주기
    }, flagDate - now);
}

export function stopFlag() {
    if (flagTimer) {
        clearInterval(flagTimer); // clearInterval과 clearTimeout은 동일한 동작 수행
        flagTimer = null;
    }
}
