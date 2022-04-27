import { ApplicationCommandOptionType } from 'discord.js';
import { request } from 'undici';
import { DEEP_API_KEY } from '../soyabot_config.js';

export const type = ['기타'];
export const commandData = {
    name: '채색',
    description: '흑백 사진과 함께 명령어를 사용하면 사진을 채색한 결과를 보여줍니다.',
    options: [
        {
            name: '사진',
            type: ApplicationCommandOptionType.Attachment,
            description: '채색을 적용할 흑백 사진',
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
        const { body } = await request('https://api.deepai.org/api/colorizer', {
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
