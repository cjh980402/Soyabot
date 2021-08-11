module.exports = {
    usage: `${client.prefix}스포트라이트`,
    command: ['스포트라이트', 'ㅅㅍㅌㄹㅇㅌ'],
    description: '- 엔젤릭버스터의 1번째 노래',
    type: ['메이플'],
    async messageExecute(message) {
        return client.commands.find((cmd) => cmd.command.includes('play')).messageExecute(message, ['https://youtu.be/2cLhHDXAdxI']);
    },
    interaction: {
        name: '스포트라이트',
        description: `엔젤릭버스터의 1번째 노래`
    },
    async commandExecute(interaction) {
        interaction.options._hoistedOptions.push({ name: '영상_주소_제목', type: 'STRING', value: 'https://youtu.be/2cLhHDXAdxI' });
        return client.commands.find((cmd) => cmd.command.includes('play')).commandExecute(interaction);
    }
};
