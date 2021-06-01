const { create, all } = require('mathjs');
const math = create(all);
const originEvaluate = math.evaluate; // 오버라이드 전에 원래 evaluate 함수를 가져옴

math.config({
    number: 'BigNumber',
    precision: 64
}); // 기본 자료형을 BigNumber로 설정

math.import(
    {
        import: function () {
            throw new Error('Function import is disabled');
        },
        createUnit: function () {
            throw new Error('Function createUnit is disabled');
        },
        evaluate: function () {
            throw new Error('Function evaluate is disabled');
        },
        parse: function () {
            throw new Error('Function parse is disabled');
        }
    },
    { override: true }
); // 일부 기능 사용을 제한한다.

function inputExpression(str) {
    return str
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'pi')
        .replace(/°/g, 'deg')
        .replace(/√/g, 'sqrt')
        .replace(/\*\*/g, '^')
        .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (all) => `^(${[...all].map((v) => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(v)).join('')})`);
}

module.exports = {
    usage: `${client.prefix}ev (계산식)`,
    command: ['ev', '계산기', 'ㄱㅅㄱ', 'ㄳㄱ'],
    description: '- 계산식에 해당하는 결과값을 보여줍니다.',
    type: ['기타'],
    async execute(message, args) {
        if (args.length < 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        try {
            return message.channel.send(String(originEvaluate(inputExpression(args.join(' ')))) || '\u200b');
        } catch {
            return message.channel.send('올바르지 않은 수식입니다.');
        }
    }
};
