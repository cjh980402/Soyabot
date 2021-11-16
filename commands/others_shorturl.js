import { fetch } from 'undici';
import { NAVER_CLIENT_ID, NAVER_CLIENT_SECRET } from '../soyabot_config.js';

async function shortURL(url) {
    const params = new URLSearchParams();
    params.set('url', url);
    const data = await (
        await fetch('https://openapi.naver.com/v1/util/shorturl', {
            method: 'POST',
            headers: {
                'X-Naver-Client-Id': NAVER_CLIENT_ID,
                'X-Naver-Client-Secret': NAVER_CLIENT_SECRET
            },
            body: params
        })
    ).json();
    if (data.message === 'ok') {
        return data.result.url;
    } else {
        return '올바르지 않은 주소거나 주소 변환에 실패했습니다.';
    }
}

export const usage = `${client.prefix}단축주소 (대상 주소)`;
export const command = ['단축주소', 'ㄷㅊㅈㅅ'];
export const description = '- 입력한 주소를 짧은 형태의 주소로 변환합니다.';
export const type = ['기타'];
export async function messageExecute(message, args) {
    if (args.length !== 1) {
        return message.channel.send(
            `**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`
        );
    }

    return message.channel.send(await shortURL(args[0]));
}
export const commandData = {
    name: '단축주소',
    description: '입력한 주소를 짧은 형태의 주소로 변환합니다.',
    options: [
        {
            name: '대상_주소',
            type: 'STRING',
            description: '짧은 형태의 주소로 변환할 주소',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    return interaction.followUp(await shortURL(interaction.options.getString('대상_주소')));
}
