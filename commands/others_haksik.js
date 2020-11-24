const cheerio = require('cheerio');
const fetch = require('node-fetch');

module.exports = {
    usage: `${client.prefix}학식 (요일)`,
    command: ["학식", "ㅎㅅ"],
    type: ["기타"],
    async execute(message, args) {
        const week = ['일', '월', '화', '수', '목', '금', '토'];
        const day = (!args[0] ? week[new Date().getDay()] : args[0][0]);

        if (day == '일' || day == '토') {
            return message.channel.send('주말은 학식이 제공되지 않습니다.');
        }
        else if (!week.includes(day)) {
            return message.channel.send('지원하지 않는 요일입니다.');
        }

        const data = cheerio.load(await (await fetch("https://www.uos.ac.kr/food/placeList.do")).text())('#week td.al');
        const dayIndex = 3 * week.indexOf(day);
        if (data.length == 15) {
            await message.channel.send(`**${day}요일의 점심!**\n${data.eq(dayIndex - 2).html().htmlDecode().trim()}`);
            return message.channel.send(`**${day}요일의 저녁!**\n${data.eq(dayIndex - 1).html().htmlDecode().trim()}`);
        }
        else {
            return message.channel.send('학식 정보를 조회할 수 없습니다.');
        }
    }
};