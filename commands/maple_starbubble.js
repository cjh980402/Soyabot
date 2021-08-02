module.exports = {
    usage: `${client.prefix}스타버블`,
    command: ['스타버블', 'ㅅㅌㅂㅂ'],
    description: '- 엔젤릭버스터의 2번째 노래',
    type: ['메이플'],
    async messageExecute(message) {
        return client.commands.find((cmd) => cmd.command.includes('play')).messageExecute(message, ['https://youtu.be/ixww1OHztbs']);
    },
    interaction: {
        name: '스타버블',
        description: `엔젤릭버스터의 2번째 노래`
    },
    async interactionExecute(interaction) {
        interaction.options._hoistedOptions.push({ name: '영상_주소_제목', type: 'STRING', value: 'https://youtu.be/ixww1OHztbs' });
        return client.commands.find((cmd) => cmd.command.includes('play')).interactionExecute(interaction);
    }
};
