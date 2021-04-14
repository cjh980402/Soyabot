const fetch = require('node-fetch');
const { load } = require('cheerio');
const iconv = require('iconv-lite');

module.exports = {
    usage: `${client.prefix}한강`,
    command: ['한강', 'ㅎㄱ'],
    description: '- 현재 한강의 수온을 알려줍니다.',
    type: ['기타'],
    async execute(message) {
        const data = load(iconv.decode(await (await fetch('http://www.koreawqi.go.kr/wQSCHomeLayout_D.wq?action_type=T#')).buffer(), 'euc-kr'));
        // 수질 정보 사이트 인코딩: euc-kr
        if (data('tr.site_S01004 > td').length != 8) {
            return message.channel.send('측정소 운전이 정지됐습니다.');
        }

        const temper = data('tr.site_S01004 > td').eq(0).text().trim();
        if (isNaN(temper)) {
            return message.channel.send(`측정소가 "${temper}" 상태입니다.`);
        } else {
            const search_time = data('span.data > script').html().trim().split('\n')[0].replace(/\D+/g, '');
            return message.channel.send(`지금 한강온도: ${temper}°C\n업데이트 시간: ${search_time.substr(0, 4)}년 ${+search_time.substr(4, 2)}월 ${+search_time.substr(6, 2)}일 ${+search_time.substr(8, 2)}시`);
        }
    }
};
