import { ApplicationCommandOptionType } from 'discord.js';
import { sendAdmin } from '../admin/bot_message.js';

export const type = '기타';
export const commandData = {
    name: '건의',
    description: '개발자에게 건의 사항을 전송합니다.',
    options: [
        {
            name: '건의_사항',
            type: ApplicationCommandOptionType.String,
            description: '개발자에게 전송할 건의 사항',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    const rslt = await sendAdmin(
        interaction.client.users,
        `${interaction.channelId}\n작성자: ${interaction.user.username}\n건의 내용: ${interaction.options.getString(
            '건의_사항'
        )}`
    );
    await interaction.followUp(rslt ? '건의사항이 전송되었습니다.' : '건의사항 전송을 실패했습니다.');
}
