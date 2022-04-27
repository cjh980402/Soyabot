import { ApplicationCommandOptionType } from 'discord.js';
import { request } from 'undici';
import { NAVER_CLIENT_ID, NAVER_CLIENT_SECRET } from '../soyabot_config.js';

async function shortURL(url) {
    const params = new URLSearchParams();
    params.set('url', url);
    const { body } = await request('https://openapi.naver.com/v1/util/shorturl', {
        method: 'POST',
        headers: {
            'X-Naver-Client-Id': NAVER_CLIENT_ID,
            'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: params.toString()
    });
    const data = await body.json();
    if (data.message === 'ok') {
        return data.result.url;
    } else {
        return '올바르지 않은 주소거나 주소 변환에 실패했습니다.';
    }
}

export const type = ['기타'];
export const commandData = {
    name: '단축주소',
    description: '입력한 주소를 짧은 형태의 주소로 변환합니다.',
    options: [
        {
            name: '대상_주소',
            type: ApplicationCommandOptionType.String,
            description: '짧은 형태의 주소로 변환할 주소',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    await interaction.followUp(await shortURL(interaction.options.getString('대상_주소')));
}
