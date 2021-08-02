const fetch = require('node-fetch');
const { load } = require('cheerio');

module.exports = {
    usage: `${client.prefix}학식 (요일)`,
    command: ['학식', 'ㅎㅅ'],
    type: ['기타'],
    async messageExecute(message, args) {
        const week = ['일', '월', '화', '수', '목', '금', '토'];
        const day = args[0]?.[0] ?? week[new Date().getDay()];

        if (day === '일' || day === '토') {
            return message.channel.send('주말은 학식이 제공되지 않습니다.');
        } else if (!week.includes(day)) {
            return message.channel.send('지원하지 않는 요일입니다.');
        }

        const data = load(await (await fetch('https://www.uos.ac.kr/food/placeList.do')).text())('#week tr');
        if (data.length >= 3) {
            // 하루 이상의 학식 데이터가 존재
            for (let i = 0; i < data.length; i += 3) {
                const date = data.eq(i).find('th[rowspan="3"]').text();
                if (date.includes(day)) {
                    await message.channel.send(
                        `${date}의 점심!\n${data
                            .eq(i + 1)
                            .find('td.al')
                            .html()
                            .decodeHTML()
                            .trim()}`
                    );
                    return message.channel.send(
                        `${date}의 저녁!\n${data
                            .eq(i + 2)
                            .find('td.al')
                            .html()
                            .decodeHTML()
                            .trim()}`
                    );
                }
            }
            return message.channel.send(`${day}요일은 학식이 제공되지 않습니다.`);
        } else {
            return message.channel.send('학식 정보를 조회할 수 없습니다.');
        }
    }
};
