module.exports = {
    usage: `${client.prefix}수로휴가`,
    command: ['수로휴가', 'ㅅㄹㅎㄱ', 'ㅅㅀㄱ'],
    description: '- 길드 지하수로 휴가 신청서를 보여줍니다.',
    type: ['메이플'],
    async messageExecute(message) {
        return message.channel.send({ content: '수로 휴가 신청서', files: ['./pictures/guild_vacation.png'] });
    },
    interaction: {
        name: '수로휴가',
        description: '길드 지하수로 휴가 신청서를 보여줍니다.'
    },
    async interactionExecute(interaction) {
        return interaction.editReply({ content: '수로 휴가 신청서', files: ['./pictures/guild_vacation.png'] });
    }
};
