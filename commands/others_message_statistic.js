module.exports = {
    usage: `${client.prefix}채팅량 (멘션)`,
    command: ['채팅량', 'ㅊㅌㄹ'],
    description: '- 첫번째 멘션에 해당하는 유저의 채팅 통계를 보여줍니다. 멘션을 생략 시에는 본인의 채팅 통계를 보여줍니다.',
    channelCool: true,
    type: ['기타'],
    async messageExecute(message) {
        if (!message.guildId) {
            return message.reply('사용이 불가능한 채널입니다.');
        }

        let targetInfo;
        if (message.mentions.users.size > 0) {
            try {
                targetInfo = await message.guild.members.fetch({ user: message.mentions.users.first().id, cache: false });
            } catch {
                return message.channel.send('서버에 존재하지 않는 사람입니다.');
            }
        } else {
            targetInfo = message.member;
        }

        const messagestat = await db.get('SELECT * FROM messagedb WHERE channelsenderid = ?', [`${message.guildId} ${targetInfo.user.id}`]);
        if (messagestat) {
            return message.channel.send(`[${targetInfo.nickname ?? targetInfo.user.username}]
채팅 건수: ${messagestat.messagecnt.toLocaleString()}
문자 개수: ${messagestat.lettercnt.toLocaleString()}
채팅 지수: ${(messagestat.lettercnt / messagestat.messagecnt).toFixed(2)}`);
        } else {
            return message.channel.send(`[${targetInfo.nickname ?? targetInfo.user.username}]\n채팅 건수: 0\n문자 개수: 0\n채팅 지수: 0.00`);
        }
    },
    interaction: {
        name: '채팅량',
        description: '첫번째 멘션에 해당하는 유저의 채팅 통계를 보여줍니다. 멘션을 생략 시에는 본인의 채팅 통계를 보여줍니다.',
        options: [
            {
                name: '멘션',
                type: 'USER',
                description: '채팅 통계를 검색할 대상'
            }
        ]
    },
    async interactionExecute(interaction) {
        if (!interaction.guildId) {
            return interaction.followUp('사용이 불가능한 채널입니다.');
        }

        const targetInfo = interaction.options.getMember('멘션') ?? interaction.member;

        const messagestat = await db.get('SELECT * FROM messagedb WHERE channelsenderid = ?', [`${interaction.guildId} ${targetInfo.user.id}`]);
        if (messagestat) {
            return interaction.followUp(`[${targetInfo.nickname ?? targetInfo.user.username}]
채팅 건수: ${messagestat.messagecnt.toLocaleString()}
문자 개수: ${messagestat.lettercnt.toLocaleString()}
채팅 지수: ${(messagestat.lettercnt / messagestat.messagecnt).toFixed(2)}`);
        } else {
            return interaction.followUp(`[${targetInfo.nickname ?? targetInfo.user.username}]\n채팅 건수: 0\n문자 개수: 0\n채팅 지수: 0.00`);
        }
    }
};
