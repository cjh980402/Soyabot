import { request } from 'undici';
import { DEEP_API_KEY, PREFIX } from '../soyabot_config.js';
import { getMessageImage } from '../util/soyabot_util.js';

export const usage = `${PREFIX}확대`;
export const command = ['확대', 'ㅎㄷ'];
export const description =
    '- 원하는 사진과 함께 명령어를 사용하면 waifu2x를 사용하여 노이즈 제거와 함께 사진을 확대합니다.';
export const type = ['기타'];
export async function messageExecute(message) {
    const imageURL = await getMessageImage(message);
    if (!imageURL) {
        await message.channel.send('사진이 포함된 메시지에 명령어를 사용해주세요.');
    } else {
        const params = new URLSearchParams();
        params.set('image', imageURL);
        const { body } = await request('https://api.deepai.org/api/waifu2x', {
            method: 'POST',
            headers: {
                'client-library': 'deepai-js-client',
                'api-key': DEEP_API_KEY,
                'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: params.toString()
        });
        const data = await body.json();
        await message.channel.send({ files: [data.output_url] });
    }
}
