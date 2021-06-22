module.exports = {
    usage: `${client.prefix}타일런트`,
    command: ['타일런트', 'ㅌㅇㄹㅌ', 'ㅌㅇㄾ'],
    description: '- 타일런트 장비의 스타포스 강화 능력치를 출력합니다.',
    type: ['메이플'],
    async execute(message) {
        return message.channel.send({ content: '타일런트 스타포스 강화 능력치 표', files: ['./pictures/tyrant.png'] });
    }
};
