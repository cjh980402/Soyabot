module.exports = {
    usage: `${client.prefix}스포트라이트`,
    command: ['스포트라이트', 'ㅅㅍㅌㄹㅇㅌ'],
    description: '- 엔젤릭버스터의 1번째 노래',
    type: ['메이플'],
    async execute(message) {
        return client.commands.find((cmd) => cmd.command.includes('play')).execute(message, ['https://youtu.be/2cLhHDXAdxI']);
    }
};
