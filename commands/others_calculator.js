import { ApplicationCommandOptionType } from 'discord.js';
import { create, all } from 'mathjs';
import { sendSplitCode } from '../util/soyabot_util.js';
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

export const type = '기타';
export const commandData = {
    name: 'ev',
    description: '계산식에 해당하는 결과값을 보여줍니다.',
    options: [
        {
            name: '계산식',
            type: ApplicationCommandOptionType.String,
            description: '결과값을 계산할 계산식',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    try {
        await sendSplitCode(
            interaction,
            String(originEvaluate(inputExpression(interaction.options.getString('계산식')))),
            { code: 'js' }
        );
    } catch {
        await interaction.followUp('올바르지 않은 수식입니다.');
    }
}
