const { MessageEmbed } = require("discord.js");
const fetch = require('node-fetch');
const cheerio = require('cheerio');
let noticeTimer = null;
let updateTimer = null;

module.exports.startNotice = function (db, client) {
    if (!noticeTimer) {
        noticeTimer = setInterval(async () => {
            const parse = cheerio.load(await (await fetch("https://maplestory.nexon.com/News/Notice")).text());
            const data = parse('li > p');

            for (let i = 0; i < data.length; i++) {
                const rslt = await db.get(`SELECT * FROM maplenotice WHERE title = ?`, [data.eq(i).text().trim()]); // 제목으로 걸러내므로 수정된 공지도 전송하게 된다.
                if (!rslt) {
                    await db.insert('maplenotice', { title: data.eq(i).text().trim(), url: `https://maplestory.nexon.com${data.eq(i).find('a').attr('href')}` });
                    // 중복방지 위해 db에 삽입

                    const noticeEmbed = new MessageEmbed()
                        .setTitle("메이플 공지사항")
                        .setDescription(`${data.eq(i).find('img').attr('alt')} ${data.eq(i).text().trim()}`)
                        .setURL(`https://maplestory.nexon.com${data.eq(i).find('a').attr('href')}`)
                        .setColor("#F8AA2A");
                        
                    const groupChat = client.guilds.cache.array().map(v => v.channels.cache.array().filter(v => v.type == 'text')[0]);
                    for (let i in groupChat)
                        setTimeout(() => { groupChat[i].send(noticeEmbed) }, 1000 * i); // 1000*i ms 이후에 주어진 함수 실행
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

module.exports.startUpdate = function (db, client) {
    if (!updateTimer) {
        updateTimer = setInterval(async () => {
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
        }, 120000);
    }
}

module.exports.stopUpdate = function () {
    if (updateTimer) {
        clearInterval(updateTimer);
        updateTimer = null;
    }
}