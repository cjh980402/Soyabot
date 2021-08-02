const { replyAdmin } = require('../admin/bot_control');

module.exports = {
    usage: `${client.prefix}건의 (건의 사항)`,
    command: ['건의', 'ㄱㅇ'],
    description: '- 개발자에게 건의 사항을 전송합니다.',
    type: ['기타'],
    messageExecute(message, args) {
        if (args.length < 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const rslt = replyAdmin(`${message.channel.id} ${message.id}\n작성자: ${message.author.username}\n건의 내용: ${args.join(' ')}`);
        return message.reply(rslt ? '건의사항이 전송되었습니다.' : '건의사항 전송을 실패했습니다.');
    },
    interaction: {
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
    },
    async interactionExecute(interaction) {
        const rslt = replyAdmin(`${interaction.channelId} ${interaction.id}\n작성자: ${interaction.user.username}\n건의 내용: ${interaction.options.get('건의_사항').value}`);
        return interaction.followUp(rslt ? '건의사항이 전송되었습니다.' : '건의사항 전송을 실패했습니다.');
    }
};
