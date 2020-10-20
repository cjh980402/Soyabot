const { MessageEmbed } = require("discord.js");
const { ADMIN_ID } = require("../config.json");
const { botNotice, replyRoomID } = require('./bot_control.js');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
let noticeTimer = null;
let updateTimer = null;
let testTimer = null;
let testPatchTimer = null;
let flagTimer = [null, null, null];

module.exports.startNotice = function () {
    if (!noticeTimer) {
        noticeTimer = setInterval(async () => {
            try {
                const parse = cheerio.load(await (await fetch("https://maplestory.nexon.com/News/Notice")).text());
                const data = parse('li > p');

                for (let i = 0; i < data.length; i++) {
                    const rslt = await db.get(`SELECT * FROM maplenotice WHERE title = ?`, [data.eq(i).text().trim()]); // 제목으로 걸러내므로 수정된 공지도 전송하게 된다.
                    const url = `https://maplestory.nexon.com${data.eq(i).find('a').attr('href')}`;
                    if (!rslt || +rslt.url.replace(/\D/g, "") < +url.replace(/\D/g, "")) { // 제목이 다르거나, 같은 경우는 최신 공지인 경우
                        await db.replace('maplenotice', { title: data.eq(i).text().trim(), url: url }); // 제목이 겹치는 경우 때문에 replace를 이용
                        // 중복방지 위해 db에 삽입

                        const noticeEmbed = new MessageEmbed()
                            .setTitle("메이플 공지사항")
                            .setDescription(`${data.eq(i).find('img').attr('alt')} ${data.eq(i).text().trim()}`)
                            .setURL(url)
                            .setColor("#F8AA2A");

                        botNotice(noticeEmbed, "notice");
                    }
                }
            }
            catch (e) {
                const adminchat = client.channels.cache.array().find(v => v.recipient == ADMIN_ID);
                if (adminchat) {
                    adminchat.sendFullText(`자동알림(공지) 파싱 중 에러 발생\n에러 내용 : ${e}\n${e.stack}`);
                }
            }
        }, 120000);
    }
}

module.exports.stopNotice = function () {
    if (noticeTimer) {
        clearInterval(noticeTimer);
        noticeTimer = null;
    }
}

module.exports.startUpdate = function () {
    if (!updateTimer) {
        updateTimer = setInterval(async () => {
            try {
                const parse = cheerio.load(await (await fetch("https://maplestory.nexon.com/News/Update")).text());
                const data = parse('li > p');

                for (let i = 0; i < data.length; i++) {
                    const rslt = await db.get(`SELECT * FROM mapleupdate WHERE title = ?`, [data.eq(i).text().trim()]); // 제목으로 걸러내므로 수정된 공지도 전송하게 된다.
                    const url = `https://maplestory.nexon.com${data.eq(i).find('a').attr('href')}`;
                    if (!rslt || +rslt.url.replace(/\D/g, "") < +url.replace(/\D/g, "")) { // 제목이 다르거나, 같은 경우는 최신 공지인 경우
                        await db.replace('mapleupdate', { title: data.eq(i).text().trim(), url: url });
                        // 중복방지 위해 db에 삽입

                        const noticeEmbed = new MessageEmbed()
                            .setTitle("메이플 업데이트")
                            .setDescription(`[패치] ${data.eq(i).text().trim()}`)
                            .setURL(url)
                            .setColor("#F8AA2A");

                        botNotice(noticeEmbed, "update");
                    }
                }
            }
            catch (e) {
                const adminchat = client.channels.cache.array().find(v => v.recipient == ADMIN_ID);
                if (adminchat) {
                    adminchat.sendFullText(`자동알림(업데이트) 파싱 중 에러 발생\n에러 내용 : ${e}\n${e.stack}`);
                }
            }
        }, 120000);
    }
}

module.exports.stopUpdate = function () {
    if (updateTimer) {
        clearInterval(updateTimer);
        updateTimer = null;
    }
}

module.exports.startTest = function () {
    if (!testTimer) {
        testTimer = setInterval(async () => {
            try {
                const parse = cheerio.load(await (await fetch("https://maplestory.nexon.com/Testworld/Totalnotice")).text());
                const data = parse('li > p');

                for (let i = 0; i < data.length; i++) {
                    const rslt = await db.get(`SELECT * FROM mapletest WHERE title = ?`, [data.eq(i).text().trim()]); // 제목으로 걸러내므로 수정된 공지도 전송하게 된다.
                    const url = `https://maplestory.nexon.com${data.eq(i).find('a').attr('href')}`;
                    if (!rslt || +rslt.url.replace(/\D/g, "") < +url.replace(/\D/g, "")) { // 제목이 다르거나, 같은 경우는 최신 공지인 경우
                        await db.replace('mapletest', { title: data.eq(i).text().trim(), url: url });
                        // 중복방지 위해 db에 삽입

                        const noticeEmbed = new MessageEmbed()
                            .setTitle("메이플 테스트월드 공지")
                            .setDescription(`${data.eq(i).find('img').attr('alt')} ${data.eq(i).text().trim()}`)
                            .setURL(url)
                            .setColor("#F8AA2A");

                        botNotice(noticeEmbed, "test");
                    }
                }
            }
            catch (e) {
                const adminchat = client.channels.cache.array().find(v => v.recipient == ADMIN_ID);
                if (adminchat) {
                    adminchat.sendFullText(`자동알림(테섭) 파싱 중 에러 발생\n에러 내용 : ${e}\n${e.stack}`);
                }
            }
        }, 120000);
    }
}

module.exports.stopTest = function () {
    if (testTimer) {
        clearInterval(testTimer);
        testTimer = null;
    }
}

module.exports.startTestPatch = function () {
    if (!testPatchTimer) {
        testPatchTimer = setInterval(async () => {
            try {
                const dball = await db.all("SELECT * FROM testpatch");
                const version = dball[dball.length - 1].version + 1;
                const patchURL = `http://maplestory.dn.nexoncdn.co.kr/PatchT/01${version}/01${version - 1}to01${version}.patch`;
                const file = (await (await fetch(patchURL)).buffer()).length / 1024 / 1024;
                if (file > 1) { // 파일이 감지된 경우
                    await db.insert('testpatch', { version: version, url: patchURL });
                    botNotice(`[Tver 1.2.${version}]\n테스트월드 패치 파일이 발견되었습니다.\n파일 크기 : ${file.toFixed(2)}MB\n패치파일 주소 : ${patchURL}`, "testpatch");
                }
            }
            catch (e) {
                const adminchat = client.channels.cache.array().find(v => v.recipient == ADMIN_ID);
                if (adminchat) {
                    adminchat.sendFullText(`자동알림(테섭파일) 파싱 중 에러 발생\n에러 내용 : ${e}\n${e.stack}`);
                }
            }
        }, 600000); // 10분마다 동작 수행
    }
}

module.exports.stopTestPatch = function () {
    if (testPatchTimer) {
        clearInterval(testPatchTimer);
        testPatchTimer = null;
    }
}

module.exports.startFlag = function () {
    const flagtime = [11, 18, 20]; // 12, 19, 21시에 시작 -> 5분전에 알림
    const now = new Date();
    for (let i in flagTimer) {
        if (!flagTimer[i]) {
            let flagDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), flagtime[i], 55); // 플래그 알림 시간 객체 저장
            if (now > flagDate) {
                flagDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, flagtime[i], 55);
            }
            setTimeout(async () => {
                botNotice(`${flagtime[i] + 1}시 플래그를 준비하세요!`, "flag");
                // setInterval은 즉시 수행은 안되므로 1번 공지를 내보내고 setInterval을 한다
                flagTimer[i] = setInterval(botNotice, 86400000, `${flagtime[i] + 1}시 플래그를 준비하세요!`, "flag"); // 24시간 주기
            }, flagDate - now);
        }
    }
}

module.exports.stopFlag = function () {
    for (let i in flagTimer) {
        if (flagTimer[i]) {
            clearInterval(flagTimer[i]);
            flagTimer[i] = null;
        }
    }
}