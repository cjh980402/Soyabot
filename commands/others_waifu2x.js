import fetch from 'node-fetch';
import FormData from 'form-data';
import { DEEP_API_KEY } from '../soyabot_config.js';
import { getMessageImage } from '../util/soyabot_util.js';

export const usage = `${client.prefix}확대`;
export const command = ['확대', 'ㅎㄷ'];
export const description = '- 원하는 사진과 함께 명령어를 사용하면 waifu2x를 사용하여 노이즈 제거와 함께 사진을 확대합니다.';
export const type = ['기타'];
export async function messageExecute(message) {
    const imageURL = await getMessageImage(message);
    if (!imageURL) {
        return message.channel.send('사진이 포함된 메시지에 명령어를 사용해주세요.');
    } else {
        const form = new FormData();
        form.append('image', imageURL);
        const resp = await (
            await fetch('https://api.deepai.org/api/waifu2x', {
                method: 'POST',
                headers: {
                    'client-library': 'deepai-js-client',
                    'api-key': DEEP_API_KEY
                },
                body: form
            })
        ).json();
        return message.channel.send({ files: [resp.output_url] });
    }
}
