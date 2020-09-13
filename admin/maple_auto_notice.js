const { MessageEmbed } = require("discord.js");
const { ADMIN_ID } = require("../config.json");
const fetch = require('node-fetch');
const cheerio = require('cheerio');
let noticeTimer = null;
let updateTimer = null;
let testTimer = null;
let flagTimer = [null, null, null];

module.exports.startNotice = function (db, client) {
    if (!noticeTimer) {
        noticeTimer = setInterval(async () => {
            try {
                const parse = cheerio.load(await (await fetch("https://maplestory.nexon.com/News/Notice")).text());
                const data = parse('li > p');

                for (let i = 0; i < data.length; i++) {
                    const rslt = await db.get(`SELECT * FROM maplenotice WHERE title = ?`, [data.eq(i).text().trim()]); // 제목으로 걸러내므로 수정된 공지도 전송하게 된다.
                    const url = `https://maplestory.nexon.com${data.eq(i).find('a').attr('href')}`;
                    if (!rslt || +rslt.url.substr(48) < +url.substr(48)) { // 제목이 다르거나, 같은 경우는 최신 공지인 경우
                        await db.replace('maplenotice', { title: data.eq(i).text().trim(), url: url }); // 제목이 겹치는 경우 때문에 replace를 이용
                        // 중복방지 위해 db에 삽입

                        const noticeEmbed = new MessageEmbed()
                            .setTitle("메이플 공지사항")
                            .setDescription(`${data.eq(i).find('img').attr('alt')} ${data.eq(i).text().trim()}`)
                            .setURL(url)
                            .setColor("#F8AA2A");

                        const groupChat = client.guilds.cache.array().map(v => v.channels.cache.array().filter(v => v.type == 'text')[0]);
                        for (let i in groupChat)
                            setTimeout(() => { groupChat[i].send(noticeEmbed) }, 1000 * i); // 1000*i ms 이후에 주어진 함수 실행
                    }
                }
            }
            catch (e) {
                client.channels.cache.array().find(v => v.recipient == ADMIN_ID).sendFullText(`자동알림(공지) 파싱 중 에러 발생\n에러 내용 : ${e}\n${e.stack}`);
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

module.exports.startUpdate = function (db, client) {
    if (!updateTimer) {
        updateTimer = setInterval(async () => {
            try {
                const parse = cheerio.load(await (await fetch("https://maplestory.nexon.com/News/Update")).text());
                const data = parse('li > p');

                for (let i = 0; i < data.length; i++) {
                    const rslt = await db.get(`SELECT * FROM mapleupdate WHERE title = ?`, [data.eq(i).text().trim()]); // 제목으로 걸러내므로 수정된 공지도 전송하게 된다.
                    if (!rslt) {
                        await db.insert('mapleupdate', { title: data.eq(i).text().trim(), url: `https://maplestory.nexon.com${data.eq(i).find('a').attr('href')}` });
                        // 중복방지 위해 db에 삽입

                        const noticeEmbed = new MessageEmbed()
                            .setTitle("메이플 업데이트")
                            .setDescription(`[공지] ${data.eq(i).text().trim()}`)
                            .setURL(`https://maplestory.nexon.com${data.eq(i).find('a').attr('href')}`)
                            .setColor("#F8AA2A");

                        const groupChat = client.guilds.cache.array().map(v => v.channels.cache.array().filter(v => v.type == 'text')[0]);
                        for (let i in groupChat)
                            setTimeout(() => { groupChat[i].send(noticeEmbed) }, 1000 * i); // 1000*i ms 이후에 주어진 함수 실행
                    }
                }
            }
            catch (e) {
                client.channels.cache.array().find(v => v.recipient == ADMIN_ID).sendFullText(`자동알림(업데이트) 파싱 중 에러 발생\n에러 내용 : ${e}\n${e.stack}`);
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

module.exports.startTest = function (db, client) {
    if (!testTimer) {
        testTimer = setInterval(async () => {
            try {
                const parse = cheerio.load(await (await fetch("https://maplestory.nexon.com/Testworld/Totalnotice")).text());
                const data = parse('li > p');

                for (let i = 0; i < data.length; i++) {
                    const rslt = await db.get(`SELECT * FROM mapletest WHERE title = ?`, [data.eq(i).text().trim()]); // 제목으로 걸러내므로 수정된 공지도 전송하게 된다.
                    if (!rslt) {
                        await db.insert('mapletest', { title: data.eq(i).text().trim(), url: `https://maplestory.nexon.com${data.eq(i).find('a').attr('href')}` });
                        // 중복방지 위해 db에 삽입

                        const noticeEmbed = new MessageEmbed()
                            .setTitle("메이플 테스트월드 공지")
                            .setDescription(`${data.eq(i).find('img').attr('alt')} ${data.eq(i).text().trim()}`)
                            .setURL(`https://maplestory.nexon.com${data.eq(i).find('a').attr('href')}`)
                            .setColor("#F8AA2A");

                        const groupChat = client.guilds.cache.array().map(v => v.channels.cache.array().filter(v => v.type == 'text')[0]);
                        for (let i in groupChat)
                            setTimeout(() => { groupChat[i].send(noticeEmbed) }, 1000 * i); // 1000*i ms 이후에 주어진 함수 실행
                    }
                }
            }
            catch (e) {
                client.channels.cache.array().find(v => v.recipient == ADMIN_ID).sendFullText(`자동알림(테섭) 파싱 중 에러 발생\n에러 내용 : ${e}\n${e.stack}`);
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

module.exports.startFlag = function (client) {
    const flagtime = [11, 18, 20]; // 12, 19, 21시에 시작 -> 5분전에 알림
    const flagDate = []; // 플래그 알림 시간 객체 저장
    const now = new Date();
    for (let i in flagTimer) {
        if (!flagTimer[i]) {
            flagDate[i] = new Date(now.getFullYear(), now.getMonth(), now.getDate(), flagtime[i], 55);
            if (now > flagDate[i]) {
                flagDate[i] = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, flagtime[i], 55);
            }
            setTimeout(() => {
                const groupChat = client.guilds.cache.array().map(v => v.channels.cache.array().filter(v => v.type == 'text')[0]);
                for (let j in groupChat)
                    setTimeout(() => { groupChat[j].send(`${flagtime[i] + 1}시 플래그를 준비하세요!`) }, 1000 * j);

                // setInterval은 즉시 수행은 안되므로 1번 공지를 내보내고 setInterval을 한다
                flagTimer[i] = setInterval(() => {
                    const groupChat = client.guilds.cache.array().map(v => v.channels.cache.array().filter(v => v.type == 'text')[0]);
                    for (let j in groupChat)
                        setTimeout(() => { groupChat[j].send(`${flagtime[i] + 1}시 플래그를 준비하세요!`) }, 1000 * j);
                }, 86400000); // 24시간 주기
            }, flagDate[i] - now);
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