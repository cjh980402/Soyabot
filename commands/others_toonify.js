import fetch from 'node-fetch';
import { FormData } from 'formdata-polyfill/esm.min.js';
import { getMessageImage } from '../util/soyabot_util.js';
import { DEEP_API_KEY } from '../soyabot_config.js';

export const usage = `${client.prefix}만화`;
export const command = ['만화', 'ㅁㅎ'];
export const description = '- 원하는 인물 사진과 함께 명령어를 사용하면 대상을 만화캐릭터처럼 변경합니다.';
export const type = ['기타'];
export async function messageExecute(message) {
    const imageURL = await getMessageImage(message);
    if (!imageURL) {
        return message.channel.send('사진이 포함된 메시지에 명령어를 사용해주세요.');
    } else {
        const form = new FormData();
        form.set('image', imageURL);
        const resp = await (
            await fetch('https://api.deepai.org/api/toonify', {
                method: 'POST',
                headers: {
                    'client-library': 'deepai-js-client',
                    'api-key': DEEP_API_KEY
                },
                body: form
            })
        ).json();
        if (resp.err) {
            return message.channel.send('사진에서 적절한 대상 인물을 찾지 못했습니다.');
        } else {
            return message.channel.send({ files: [resp.output_url] });
        }
    }
}
