import { ApplicationCommandOptionType } from 'discord.js';
import { request } from 'undici';
import { DEEP_API_KEY, PREFIX } from '../soyabot_config.js';
import { getMessageImage } from '../util/soyabot_util.js';

export const usage = `${PREFIX}만화`;
export const command = ['만화', 'ㅁㅎ'];
export const description = '- 인물 사진과 함께 명령어를 사용하면 대상을 만화캐릭터처럼 변경합니다.';
export const type = ['기타'];
export async function messageExecute(message) {
    const imageURL = await getMessageImage(message);
    if (!imageURL) {
        await message.channel.send('사진이 포함된 메시지에 명령어를 사용해주세요.');
    } else {
        const params = new URLSearchParams();
        params.set('image', imageURL);
        const { body } = await request('https://api.deepai.org/api/toonify', {
            method: 'POST',
            headers: {
                'client-library': 'deepai-js-client',
                'api-key': DEEP_API_KEY,
                'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: params.toString()
        });
        const data = await body.json();
        if (data.err) {
            await message.channel.send('사진에서 적절한 대상 인물을 찾지 못했습니다.');
        } else {
            await message.channel.send({ files: [data.output_url] });
        }
    }
}
export const commandData = {
    name: '만화',
    description: '인물 사진과 함께 명령어를 사용하면 대상을 만화캐릭터처럼 변경합니다.',
    options: [
        {
            name: '사진',
            type: ApplicationCommandOptionType.Attachment,
            description: '만화캐릭터처럼 변경할 인물 사진',
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
        const params = new URLSearchParams();
        params.set('image', imageURL);
        const { body } = await request('https://api.deepai.org/api/toonify', {
            method: 'POST',
            headers: {
                'client-library': 'deepai-js-client',
                'api-key': DEEP_API_KEY,
                'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: params.toString()
        });
        const data = await body.json();
        if (data.err) {
            await interaction.followUp('사진에서 적절한 대상 인물을 찾지 못했습니다.');
        } else {
            await interaction.followUp({ files: [data.output_url] });
        }
    }
}
