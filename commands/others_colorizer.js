import { DEEP_API_KEY } from '../soyabot_config.js';
import { getMessageImage } from '../util/soyabot_util.js';
import deepai from 'deepai';
deepai.setApiKey(DEEP_API_KEY);

export const usage = `${client.prefix}채색`;
export const command = ['채색', 'ㅊㅅ'];
export const description = '- 원하는 흑백 사진과 함께 명령어를 사용하면 사진을 채색한 결과를 보여줍니다.';
export const type = ['기타'];
export async function messageExecute(message) {
    const imageURL = await getMessageImage(message);
    if (!imageURL) {
        return message.channel.send('사진이 포함된 메시지에 명령어를 사용해주세요.');
    } else {
        const resp = await deepai.callStandardApi('colorizer', { image: imageURL });
        return message.channel.send({ files: [resp.output_url] });
    }
}
