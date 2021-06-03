const { matchString } = require('../util/soyabot_const.json');
const Hangul = require('hangul-js');

module.exports = {
    usage: `${client.prefix}타자대결 (옵션)`,
    command: ['타자대결', 'ㅌㅈㄷㄱ'],
    description: `- 임의의 문장을 빨리 치는 사람이 승리하는 타자 대결을 수행합니다.
- 옵션에 한을 입력 시 한글, 영을 입력 시 영어, 생략 시 둘 다 나옵니다.`,
    channelCool: true,
    type: ['기타'],
    async execute(message, args) {
        const [min, max] = /^한글?$/.test(args[0]) ? [0, 1119] : /^영어?$/.test(args[0]) ? [1120, matchString.length - 1] : [0, matchString.length - 1];
        const random = Math.floor(Math.random() * (max - min + 1)) + min; // 랜덤 선택된 문장의 인덱스
        const choice = matchString[random];
        const choiceLength = Hangul.disassemble(choice).length;
        message.channel.send(`이번 문장은 ${random <= 1119 ? '한글' : '영어'} 문장입니다.`);

        for (let i = 3; i > 0; i--) {
            message.channel.send(i);
            await sleep(1000); // 3초 카운트 다운 로직
        }
        message.channel.send(`대결할 문장: ${[...choice].join('\u200b')}\n\n위 문장으로 대결을 수행합니다.`);

        const start = Date.now();
        const winMessage = (await message.channel.awaitMessages((msg) => msg.content === choice, { max: 1, time: 40000, errors: ['time'] })).first();
        const time = (Date.now() - start) / 1000;
        return winMessage.reply(`${winMessage.member?.nickname ?? winMessage.author.username}님이 승리하였습니다!
소요시간: ${time.toFixed(2)}초\n분당타수: ${((choiceLength * 60) / time).toFixed(2)}타`);
    }
};
