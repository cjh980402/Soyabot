import { MessageEmbed } from 'discord.js';
import { request } from 'undici';
import { load } from 'cheerio';
import { botNotice, replyAdmin } from './bot_control.js';
let noticeTimer = null;
let updateTimer = null;
let testTimer = null;
let testPatchTimer = null;
let urusTimer = null;

export function startNotice(client) {
    if (!noticeTimer) {
        noticeTimer = setInterval(async () => {
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
                    const noticeEmbed = new MessageEmbed()
                        .setTitle('**메이플 공지사항**')
                        .setColor('#FF9999')
                        .setDescription(notice.join('\n\n'))
                        .setTimestamp();

                    botNotice(client, noticeEmbed, true);
                }
            } catch (err) {
                replyAdmin(client.users, `자동알림(공지) 파싱 중 에러 발생\n에러 내용: ${err.stack}`);
            }
        }, 127000);
    }
}

export function stopNotice() {
    if (noticeTimer) {
        clearInterval(noticeTimer);
        noticeTimer = null;
    }
}

export function startUpdate(client) {
    if (!updateTimer) {
        updateTimer = setInterval(async () => {
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
                    const noticeEmbed = new MessageEmbed()
                        .setTitle('**메이플 업데이트**')
                        .setColor('#FF9999')
                        .setDescription(update.join('\n\n'))
                        .setTimestamp();

                    botNotice(client, noticeEmbed, true);
                }
            } catch (err) {
                replyAdmin(client.users, `자동알림(업데이트) 파싱 중 에러 발생\n에러 내용: ${err.stack}`);
            }
        }, 131000);
    }
}

export function stopUpdate() {
    if (updateTimer) {
        clearInterval(updateTimer);
        updateTimer = null;
    }
}

export function startTest(client) {
    if (!testTimer) {
        testTimer = setInterval(async () => {
            try {
                const { body } = await request('https://maplestory.nexon.com/Testworld/Totalnotice');
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
                    const noticeEmbed = new MessageEmbed()
                        .setTitle('**메이플 테스트월드 공지**')
                        .setColor('#FF9999')
                        .setDescription(test.join('\n\n'))
                        .setTimestamp();

                    botNotice(client, noticeEmbed, true);
                }
            } catch (err) {
                replyAdmin(client.users, `자동알림(테섭) 파싱 중 에러 발생\n에러 내용: ${err.stack}`);
            }
        }, 137000);
    }
}

export function stopTest() {
    if (testTimer) {
        clearInterval(testTimer);
        testTimer = null;
    }
}

export function startTestPatch(client) {
    if (!testPatchTimer) {
        testPatchTimer = setInterval(async () => {
            try {
                const lastPatch = client.db.get('SELECT * FROM test_patch ORDER BY version DESC LIMIT 1');
                const patchVersion = (lastPatch?.version ?? 139) + 1; // 새로 가져올 패치의 버전
                const patchURL = `http://maplestory.dn.nexoncdn.co.kr/PatchT/01${patchVersion}/01${
                    patchVersion - 1
                }to01${patchVersion}.patch`;

                const { headers, body } = await request(patchURL);
                if (headers['content-type'] === 'application/octet-stream') {
                    // 파일이 감지된 경우
                    const fileSize = +headers['content-length'] / 1024 / 1024;
                    client.db.insert('test_patch', { version: patchVersion, url: patchURL });
                    botNotice(
                        client,
                        `[Tver 1.2.${patchVersion}]\n테스트월드 패치 파일이 발견되었습니다.\n파일 크기: ${fileSize.toFixed(
                            2
                        )}MB\n패치파일 주소: ${patchURL}`,
                        true
                    );
                }
                for await (const _ of body); // 메모리 누수 방지를 위한 force consumption of body
            } catch (err) {
                replyAdmin(client.users, `자동알림(테섭파일) 파싱 중 에러 발생\n에러 내용: ${err.stack}`);
            }
        }, 139000);
    }
}

export function stopTestPatch() {
    if (testPatchTimer) {
        clearInterval(testPatchTimer);
        testPatchTimer = null;
    }
}

export function startUrus(client) {
    if (!urusTimer) {
        const now = new Date();
        const urusDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22, 30); // 우르스 알림 시간 객체 저장
        if (now > urusDate) {
            urusDate.setDate(now.getDate() + 1); // 우르스 알림 시간 지났으면 다음 날로 알림 설정
        }
        urusTimer = setTimeout(() => {
            botNotice(client, '우르스 메소 2배 종료까지 30분 남았습니다!', true);
            // setInterval은 즉시 수행은 안되므로 1번 공지를 내보내고 setInterval을 한다
            urusTimer = setInterval(botNotice, 86400000, client, '우르스 메소 2배 종료까지 30분 남았습니다!', true); // 24시간 주기
        }, urusDate - now);
    }
}

export function stopUrus() {
    if (urusTimer) {
        clearInterval(urusTimer); // clearInterval과 clearTimeout은 동일한 동작 수행
        urusTimer = null;
    }
}
