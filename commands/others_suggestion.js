import { PREFIX } from '../soyabot_config.js';
import { sendAdmin } from '../admin/bot_message.js';

export const usage = `${PREFIX}건의 (건의 사항)`;
export const command = ['건의', 'ㄱㅇ'];
export const description = '- 개발자에게 건의 사항을 전송합니다.';
export const type = ['기타'];
export async function messageExecute(message, args) {
    if (args.length < 1) {
        return message.channel.send(`**${usage}**\n- 대체 명령어: ${command.join(', ')}\n${description}`);
    }

    const rslt = await sendAdmin(
        message.client.users,
        `${message.channelId} ${message.id}\n작성자: ${message.author.username}\n건의 내용: ${args.join(' ')}`
    );
    return message.reply(rslt ? '건의사항이 전송되었습니다.' : '건의사항 전송을 실패했습니다.');
}
export const commandData = {
    name: '건의',
    description: '개발자에게 건의 사항을 전송합니다.',
    options: [
        {
            name: '건의_사항',
            type: 'STRING',
            description: '개발자에게 전송할 건의 사항',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    const rslt = await sendAdmin(
        interaction.client.users,
        `${interaction.channelId} ${interaction.id}\n작성자: ${
            interaction.user.username
        }\n건의 내용: ${interaction.options.getString('건의_사항')}`
    );
    return interaction.followUp(rslt ? '건의사항이 전송되었습니다.' : '건의사항 전송을 실패했습니다.');
}
