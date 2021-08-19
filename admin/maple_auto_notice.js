const { MessageEmbed } = require('../util/discord.js-extend');
const { botNotice, replyAdmin } = require('./bot_control.js');
const fetch = require('node-fetch');
const { load } = require('cheerio');
let noticeTimer = null;
let updateTimer = null;
let testTimer = null;
let testPatchTimer = null;
let urusTimer = null;

module.exports.startNotice = function () {
    if (!noticeTimer) {
        noticeTimer = setInterval(async () => {
            try {
                const data = load(await (await fetch('https://maplestory.nexon.com/News/Notice')).text())('.news_board li > p');

                const notice = [];
                for (let i = 0; i < data.length; i++) {
                    const rslt = db.get('SELECT * FROM maplenotice WHERE title = ?', [data.eq(i).text().trim()]); // 제목으로 걸러내므로 수정된 공지도 전송하게 된다.
                    const url = `https://maplestory.nexon.com${data.eq(i).find('a').attr('href')}`;
                    if (!rslt || +/\d+/.exec(rslt.url) < +/\d+/.exec(url)) {
                        // 제목이 다르거나, 같은 경우는 최신 공지인 경우
                        db.replace('maplenotice', { title: data.eq(i).text().trim(), url: url }); // 제목이 겹치는 경우 때문에 replace를 이용
                        // 중복방지 위해 db에 삽입
                        notice.push(`${data.eq(i).find('img').attr('alt')} [${data.eq(i).text().trim()}](${url})`);
                    }
                }

                if (notice.length > 0) {
                    const noticeEmbed = new MessageEmbed().setTitle('**메이플 공지사항**').setDescription(notice.join('\n\n')).setColor('#FF9999').setTimestamp();

                    botNotice(noticeEmbed, 'notice');
                }
            } catch (err) {
                replyAdmin(`자동알림(공지) 파싱 중 에러 발생\n에러 내용: ${err}\n${err.stack ?? err._p}`);
            }
        }, 120000);
    }
};

module.exports.stopNotice = function () {
    if (noticeTimer) {
        clearInterval(noticeTimer);
        noticeTimer = null;
    }
};

module.exports.startUpdate = function () {
    if (!updateTimer) {
        updateTimer = setInterval(async () => {
            try {
                const data = load(await (await fetch('https://maplestory.nexon.com/News/Update')).text())('.update_board li > p');

                const update = [];
                for (let i = 0; i < data.length; i++) {
                    const rslt = db.get('SELECT * FROM mapleupdate WHERE title = ?', [data.eq(i).text().trim()]); // 제목으로 걸러내므로 수정된 공지도 전송하게 된다.
                    const url = `https://maplestory.nexon.com${data.eq(i).find('a').attr('href')}`;
                    if (!rslt || +/\d+/.exec(rslt.url) < +/\d+/.exec(url)) {
                        // 제목이 다르거나, 같은 경우는 최신 공지인 경우
                        db.replace('mapleupdate', { title: data.eq(i).text().trim(), url: url });
                        // 중복방지 위해 db에 삽입
                        update.push(`[패치] [${data.eq(i).text().trim()}](${url})`);
                    }
                }

                if (update.length > 0) {
                    const noticeEmbed = new MessageEmbed().setTitle('**메이플 업데이트**').setDescription(update.join('\n\n')).setColor('#FF9999').setTimestamp();

                    botNotice(noticeEmbed, 'update');
                }
            } catch (err) {
                replyAdmin(`자동알림(업데이트) 파싱 중 에러 발생\n에러 내용: ${err}\n${err.stack ?? err._p}`);
            }
        }, 120000);
    }
};

module.exports.stopUpdate = function () {
    if (updateTimer) {
        clearInterval(updateTimer);
        updateTimer = null;
    }
};

module.exports.startTest = function () {
    if (!testTimer) {
        testTimer = setInterval(async () => {
            try {
                const data = load(await (await fetch('https://maplestory.nexon.com/Testworld/Totalnotice')).text())('.news_board li > p');

                const test = [];
                for (let i = 0; i < data.length; i++) {
                    const rslt = db.get('SELECT * FROM mapletest WHERE title = ?', [data.eq(i).text().trim()]); // 제목으로 걸러내므로 수정된 공지도 전송하게 된다.
                    const url = `https://maplestory.nexon.com${data.eq(i).find('a').attr('href')}`;
                    if (!rslt || +/\d+/.exec(rslt.url) < +/\d+/.exec(url)) {
                        // 제목이 다르거나, 같은 경우는 최신 공지인 경우
                        db.replace('mapletest', { title: data.eq(i).text().trim(), url: url });
                        // 중복방지 위해 db에 삽입
                        const picurl = data.eq(i).find('img').attr('src');
                        const type = picurl.endsWith('1.png') ? '[공지]' : picurl.endsWith('2.png') ? '[GM]' : picurl.endsWith('3.png') ? '[점검]' : '[패치]';
                        test.push(`${type} [${data.eq(i).text().trim()}](${url})`);
                    }
                }

                if (test.length > 0) {
                    const noticeEmbed = new MessageEmbed().setTitle('**메이플 테스트월드 공지**').setDescription(test.join('\n\n')).setColor('#FF9999').setTimestamp();

                    botNotice(noticeEmbed, 'test');
                }
            } catch (err) {
                replyAdmin(`자동알림(테섭) 파싱 중 에러 발생\n에러 내용: ${err}\n${err.stack ?? err._p}`);
            }
        }, 120000);
    }
};

module.exports.stopTest = function () {
    if (testTimer) {
        clearInterval(testTimer);
        testTimer = null;
    }
};

module.exports.startTestPatch = function () {
    if (!testPatchTimer) {
        testPatchTimer = setInterval(async () => {
            try {
                const lastPatch = db.get('SELECT * FROM testpatch ORDER BY version DESC LIMIT 1');
                const patchVersion = lastPatch.version + 1; // 새로 가져올 패치의 버전
                const patchURL = `http://maplestory.dn.nexoncdn.co.kr/PatchT/01${patchVersion}/01${patchVersion - 1}to01${patchVersion}.patch`;
                const patchHeader = (await fetch(patchURL)).headers;
                if (patchHeader.get('content-type') === 'application/octet-stream') {
                    // 파일이 감지된 경우
                    const fileSize = +patchHeader.get('content-length') / 1024 / 1024;
                    db.insert('testpatch', { version: patchVersion, url: patchURL });
                    botNotice(`[Tver 1.2.${patchVersion}]\n테스트월드 패치 파일이 발견되었습니다.\n파일 크기: ${fileSize.toFixed(2)}MB\n패치파일 주소: ${patchURL}`, 'testpatch');
                }
            } catch (err) {
                replyAdmin(`자동알림(테섭파일) 파싱 중 에러 발생\n에러 내용: ${err}\n${err.stack ?? err._p}`);
            }
        }, 120000);
    }
};

module.exports.stopTestPatch = function () {
    if (testPatchTimer) {
        clearInterval(testPatchTimer);
        testPatchTimer = null;
    }
};

module.exports.startUrus = function () {
    if (!urusTimer) {
        const now = new Date();
        const urusDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22, 30); // 우르스 알림 시간 객체 저장
        if (now > urusDate) {
            urusDate.setDate(now.getDate() + 1); // 우르스 알림 시간 지났으면 다음 날로 알림 설정
        }
        urusTimer = setTimeout(() => {
            botNotice('우르스 메소 2배 종료까지 30분 남았습니다!', 'urus'); // 그룹챗에만 공지
            // setInterval은 즉시 수행은 안되므로 1번 공지를 내보내고 setInterval을 한다
            urusTimer = setInterval(botNotice, 86400000, '우르스 메소 2배 종료까지 30분 남았습니다!', 'urus'); // 24시간 주기
        }, urusDate - now);
    }
};

module.exports.stopUrus = function () {
    if (urusTimer) {
        clearInterval(urusTimer); // clearInterval과 clearTimeout은 동일한 동작 수행
        urusTimer = null;
    }
};
