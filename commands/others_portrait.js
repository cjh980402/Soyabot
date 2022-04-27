import { Attachment, ApplicationCommandOptionType } from 'discord.js';
import { request } from 'undici';
import { BOT_SERVER_DOMAIN } from '../soyabot_config.js';
// import { exec } from '../admin/admin_function.js';

export const type = ['기타'];
export const commandData = {
    name: '그림',
    description: '사진을 흑백 스케치화 해줍니다.',
    options: [
        {
            name: '사진',
            type: ApplicationCommandOptionType.Attachment,
            description: '흑백 스케치화할 사진',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    const attachment = interaction.options.getAttachment('사진');
    const imageURL = attachment.height ? attachment.url : null;
    if (!imageURL) {
        await interaction.followUp('사진과 함께 명령어를 사용해주세요.');
    } else {
        /*const { stdout: portraitPic } = await exec(`python3 ./util/python/gl2face_portrait.py ${imageURL}`, { encoding: 'buffer' }); // 파이썬 스크립트 실행
        const image = new Attachment(portraitPic, 'portrait.png');*/
        const { statusCode, body } = await request(
            `http://${BOT_SERVER_DOMAIN}/portrait/${encodeURIComponent(imageURL)}`,
            {
                headersTimeout: 240000
            }
        ); // 그림 작업은 오래걸리므로 시간 제한을 4분으로 변경
        if (200 <= statusCode && statusCode <= 299) {
            const image = new Attachment(Buffer.from(await body.arrayBuffer()), 'portrait.png');
            await interaction.followUp({ files: [image] });
        } else {
            await interaction.followUp('그림 작업을 실패했습니다.');
            for await (const _ of body); // 메모리 누수 방지를 위한 force consumption of body
        }
    }
}
