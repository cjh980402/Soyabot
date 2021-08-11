module.exports = {
    usage: `${client.prefix}놀장강`,
    command: ['놀장강', 'ㄴㅈㄱ', 'ㄵㄱ'],
    description: '- 일반 장비의 놀장강 강화 능력치를 출력합니다.',
    type: ['메이플'],
    async messageExecute(message) {
        return message.channel.send({ content: '놀장강 강화 능력치 표', files: ['./pictures/noljang.png'] });
    },
    interaction: {
        name: '놀장강',
        description: '일반 장비의 놀장강 강화 능력치를 출력합니다.'
    },
    async commandExecute(interaction) {
        return interaction.followUp({ content: '놀장강 강화 능력치 표', files: ['./pictures/noljang.png'] });
    }
};
