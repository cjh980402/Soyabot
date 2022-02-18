import { MessageAttachment } from 'discord.js';
import { request } from 'undici';
// import { exec } from '../admin/admin_function.js';
import { getMessageImage } from '../util/soyabot_util.js';
import { BOT_SERVER_DOMAIN } from '../soyabot_config.js';

export const usage = `${client.prefix}그림`;
export const command = ['그림', 'ㄱㄹ'];
export const description = '- 사진을 흑백 스케치화 해줍니다.';
export const type = ['기타'];
export async function messageExecute(message) {
    const imageURL = await getMessageImage(message);
    if (!imageURL) {
        return message.channel.send('사진이 포함된 메시지에 명령어를 사용해주세요.');
    } else {
        /*const { stdout: portraitPic } = await exec(`python3 ./util/gl2face_portrait.py ${imageURL}`, { encoding: 'buffer' }); // 파이썬 스크립트 실행
        const image = new MessageAttachment(portraitPic, 'portrait.png');*/
        const { statusCode, body } = await request(
            `http://${BOT_SERVER_DOMAIN}/portrait/${encodeURIComponent(imageURL)}`
        );
        if (200 <= statusCode && statusCode <= 299) {
            const image = new MessageAttachment(Buffer.from(await body.arrayBuffer()), 'portrait.png');
            return message.channel.send({ files: [image] });
        } else {
            for await (const _ of body); // 메모리 누수 방지를 위한 force consumption of body
            return message.channel.send('그림 작업을 실패하였습니다.');
        }
    }
}
