module.exports = {
    usage: `${client.prefix}스타포스`,
    command: ['스타포스', 'ㅅㅌㅍㅅ'],
    description: '- 130 ~ 200제 일반 장비의 스타포스 누적 능력치를 출력합니다. (135제는 130제 템과 동일한 능력치)',
    type: ['메이플'],
    async messageExecute(message) {
        return message.channel.send({ content: '일반 장비의 스타포스 누적 능력치 표', files: ['./pictures/starforce.png'] });
    },
    commandData: {
        name: '스타포스',
        description: '130 ~ 200제 일반 장비의 스타포스 누적 능력치를 출력합니다. (135제는 130제 템과 동일한 능력치)'
    },
    async commandExecute(interaction) {
        return interaction.followUp({ content: '일반 장비의 스타포스 누적 능력치 표', files: ['./pictures/starforce.png'] });
    }
};
