const { NAVER_CLIENT_ID, NAVER_CLIENT_SECRET } = require('../soyabot_config.json');
const fetch = require('node-fetch');

async function shortURL(url) {
    const params = new URLSearchParams();
    params.append('url', url);
    const response = await fetch('https://openapi.naver.com/v1/util/shorturl', {
        method: 'POST',
        headers: {
            'X-Naver-Client-Id': NAVER_CLIENT_ID,
            'X-Naver-Client-Secret': NAVER_CLIENT_SECRET
        },
        body: params
    });
    const data = await response.json();
    if (data.message == 'ok') {
        return data.result.url;
    } else {
        return '올바르지 않은 주소거나 주소 변환에 실패했습니다.';
    }
}

module.exports = {
    usage: `${client.prefix}단축주소 (대상 주소)`,
    command: ['단축주소', 'ㄷㅊㅈㅅ'],
    description: '- 입력한 주소를 짧은 형태의 주소로 변환합니다.',
    type: ['기타'],
    async execute(message, args) {
        if (args.length != 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        return message.channel.send(await shortURL(args[0]));
    }
};
