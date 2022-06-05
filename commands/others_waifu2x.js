import { ApplicationCommandOptionType } from 'discord.js';
import { request } from 'undici';
import { DEEP_API_KEY } from '../soyabot_config.js';

export const type = '기타';
export const commandData = {
    name: '확대',
    description: '사진과 함께 명령어를 사용하면 waifu2x를 사용하여 노이즈 제거와 함께 사진을 확대합니다.',
    options: [
        {
            name: '사진',
            type: ApplicationCommandOptionType.Attachment,
            description: '노이즈 제거와 확대를 적용할 사진',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    const attachment = interaction.options.getAttachment('사진');
    const imageURL = attachment.height ? attachment.attachment : null;
    if (!imageURL) {
        await interaction.followUp('사진과 함께 명령어를 사용해주세요.');
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
        await interaction.followUp({ files: [data.output_url] });
    }
}
