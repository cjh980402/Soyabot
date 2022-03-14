import { PREFIX } from '../soyabot_config.js';
import { levelTable } from '../util/soyabot_const.js';
const probTable = [
    [5, 5, 5, 5, 5, 5, 10, 20, 20, 20],
    [5, 5, 5, 5, 5, 10, 10, 20, 20, 15],
    [5, 5, 5, 5, 5, 10, 20, 15, 15, 15],
    [5, 5, 5, 5, 5, 20, 10, 15, 15, 15],
    [5, 5, 5, 10, 10, 10, 10, 15, 15, 15],
    [5, 5, 5, 10, 10, 10, 15, 15, 15, 10],
    [5, 5, 5, 10, 10, 15, 15, 15, 10, 10],
    [5, 5, 5, 10, 15, 15, 15, 10, 10, 10],
    [5, 5, 10, 10, 15, 10, 15, 10, 10, 10],
    [5, 5, 10, 15, 10, 15, 10, 10, 10, 10],
    [5, 5, 10, 10, 15, 20, 10, 10, 10, 5],
    [5, 5, 10, 10, 20, 15, 15, 10, 5, 5],
    [5, 5, 10, 15, 15, 20, 10, 10, 5, 5],
    [5, 5, 10, 20, 20, 10, 10, 10, 5, 5],
    [5, 10, 10, 20, 15, 10, 10, 10, 5, 5],
    [10, 10, 10, 15, 15, 10, 10, 10, 5, 5],
    [10, 10, 15, 15, 10, 10, 10, 10, 5, 5],
    [10, 15, 15, 10, 10, 10, 10, 10, 5, 5],
    [15, 20, 5, 10, 10, 10, 10, 10, 5, 5],
    [15, 10, 15, 15, 10, 10, 10, 5, 5, 5],
    [15, 15, 15, 10, 10, 10, 10, 5, 5, 5],
    [20, 15, 10, 10, 10, 10, 10, 5, 5, 5],
    [15, 20, 15, 10, 10, 10, 5, 5, 5, 5],
    [20, 20, 10, 10, 10, 10, 5, 5, 5, 5],
    [20, 20, 15, 10, 10, 5, 5, 5, 5, 5],
    [20, 15, 15, 15, 10, 10, 5, 5, 5, 0],
    [20, 20, 15, 10, 10, 10, 5, 5, 5, 0],
    [20, 25, 10, 10, 10, 10, 5, 5, 5, 0],
    [25, 20, 10, 10, 10, 10, 5, 5, 5, 0],
    [25, 20, 15, 10, 10, 5, 5, 5, 5, 0],
    [25, 20, 10, 15, 10, 10, 5, 5, 0, 0],
    [25, 20, 15, 15, 10, 5, 5, 5, 0, 0],
    [25, 25, 15, 10, 10, 5, 5, 5, 0, 0],
    [25, 30, 10, 10, 10, 5, 5, 5, 0, 0],
    [30, 20, 20, 10, 5, 5, 5, 5, 0, 0],
    [25, 20, 25, 10, 10, 5, 5, 0, 0, 0],
    [30, 20, 20, 10, 10, 5, 5, 0, 0, 0],
    [30, 25, 15, 10, 10, 5, 5, 0, 0, 0],
    [30, 25, 20, 10, 5, 5, 5, 0, 0, 0],
    [35, 25, 20, 5, 5, 5, 5, 0, 0, 0],
    [35, 30, 15, 10, 5, 5, 0, 0, 0, 0],
    [35, 35, 15, 5, 5, 5, 0, 0, 0, 0],
    [40, 35, 10, 5, 5, 5, 0, 0, 0, 0],
    [50, 25, 10, 5, 5, 5, 0, 0, 0, 0],
    [55, 25, 5, 5, 5, 5, 0, 0, 0, 0],
    [50, 30, 10, 5, 5, 0, 0, 0, 0, 0],
    [50, 35, 5, 5, 5, 0, 0, 0, 0, 0],
    [60, 25, 5, 5, 5, 0, 0, 0, 0, 0],
    [60, 25, 10, 5, 0, 0, 0, 0, 0, 0],
    [55, 35, 10, 0, 0, 0, 0, 0, 0, 0],
    [60, 35, 5, 0, 0, 0, 0, 0, 0, 0],
    [65, 30, 5, 0, 0, 0, 0, 0, 0, 0],
    [65, 35, 0, 0, 0, 0, 0, 0, 0, 0],
    [75, 25, 0, 0, 0, 0, 0, 0, 0, 0],
    [80, 20, 0, 0, 0, 0, 0, 0, 0, 0],
    [85, 15, 0, 0, 0, 0, 0, 0, 0, 0],
    [90, 10, 0, 0, 0, 0, 0, 0, 0, 0],
    [95, 5, 0, 0, 0, 0, 0, 0, 0, 0],
    [100, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

function extremePotion(startlev, endlev) {
    let rslt = '',
        cnt = 0;

    for (let lev = startlev; lev < endlev; cnt++) {
        const now = Math.floor(Math.random() * 100 + 1);
        let sum = 0,
            i = 0;
        for (i = 0; i < 10; i++) {
            sum += probTable[lev - 141][i];
            if (now <= sum) {
                break;
            }
        }
        rslt += `${lev}레벨 → ${(lev += i + 1)}레벨 (${i + 1}레벨 상승)\n`;
    }
    return `${rslt}총 ${cnt}개의 익성비를 소모`;
}

export const usage = `${PREFIX}익성비 (시작 레벨) (목표 레벨)`;
export const command = ['익성비', 'ㅇㅅㅂ', '풀장', 'ㅍㅈ'];
export const description = `- 시작 레벨 ~ 목표 레벨의 익성비 시뮬레이션을 수행합니다.
- 200레벨 이상의 경우 시작 레벨만 입력해주세요.
- 참고. ${PREFIX}익성비 확률 (시작 레벨)`;
export const type = ['메이플'];
export async function messageExecute(message, args) {
    if (args.length !== 1 && args.length !== 2) {
        return message.channel.send(`**${usage}**\n- 대체 명령어: ${command.join(', ')}\n${description}`);
    }

    if (args[0] === '확률' || args[0] === 'ㅎㄹ') {
        const startlev = Math.trunc(args[1]);
        let rslt = `<${startlev}레벨 기준 확률>`;
        if (isNaN(startlev) || startlev < 141 || startlev > 199) {
            return message.channel.send('141 ~ 199 범위의 기준 레벨을 입력해주세요.');
        }
        for (let i = 0; i < 10; i++) {
            rslt += `\n${i + 1} 레벨업 확률: ${probTable[startlev - 141][i]}%`;
        }
        return message.channel.send(rslt);
    }

    const startlev = Math.trunc(args[0]);
    if (args.length === 2) {
        const endlev = Math.trunc(args[1]);
        if (isNaN(startlev) || startlev < 141 || startlev > 199) {
            return message.channel.send('141 ~ 199 범위의 시작 레벨을 입력해주세요.');
        }
        if (isNaN(endlev) || endlev < startlev || endlev > 200) {
            return message.channel.send('시작 레벨 ~ 200 범위의 목표 레벨을 입력해주세요.');
        }
        return message.channel.send(extremePotion(startlev, endlev));
    } else {
        if (isNaN(startlev) || startlev < 200 || startlev > 299) {
            return message.channel.send('200 ~ 299 범위의 시작 레벨을 입력해주세요.');
        }
        const exp199 = levelTable[199] - levelTable[198];
        const expNow = levelTable[startlev] - levelTable[startlev - 1];
        return message.channel.send(`Lv.${startlev} 익성비 효과\n경험치: ${((exp199 / expNow) * 100).toFixed(3)}%`);
    }
}
export const commandData = {
    name: '익성비',
    description: `시작 레벨 ~ 목표 레벨의 익성비 시뮬레이션을 수행, 200레벨 이상의 경우 시작 레벨만 입력해야합니다. 참고. ${PREFIX}익성비 확률 (시작 레벨)`,
    options: [
        {
            name: '시작_레벨',
            type: 'STRING',
            description: '익성비 시뮬을 시작할 시작 레벨',
            required: true
        },
        {
            name: '목표_레벨',
            type: 'INTEGER',
            description: '익성비 시뮬의 목표 레벨'
        }
    ]
};
export async function commandExecute(interaction) {
    const startString = interaction.options.getString('시작_레벨');
    const endlev = interaction.options.getInteger('목표_레벨');

    if (startString === '확률' || startString === 'ㅎㄹ') {
        const startlev = endlev;
        let rslt = `<${startlev}레벨 기준 확률>`;
        if (startlev < 141 || startlev > 199) {
            return interaction.followUp('141 ~ 199 범위의 기준 레벨을 입력해주세요.');
        }
        for (let i = 0; i < 10; i++) {
            rslt += `\n${i + 1} 레벨업 확률: ${probTable[startlev - 141][i]}%`;
        }
        return interaction.followUp(rslt);
    }

    const startlev = Math.trunc(startString);
    if (endlev) {
        if (isNaN(startlev) || startlev < 141 || startlev > 199) {
            return interaction.followUp('141 ~ 199 범위의 시작 레벨을 입력해주세요.');
        }
        if (endlev < startlev || endlev > 200) {
            return interaction.followUp('시작 레벨 ~ 200 범위의 목표 레벨을 입력해주세요.');
        }
        return interaction.followUp(extremePotion(startlev, endlev));
    } else {
        if (isNaN(startlev) || startlev < 200 || startlev > 299) {
            return interaction.followUp('200 ~ 299 범위의 시작 레벨을 입력해주세요.');
        }
        const exp199 = levelTable[199] - levelTable[198];
        const expNow = levelTable[startlev] - levelTable[startlev - 1];
        return interaction.followUp(`Lv.${startlev} 익성비 효과\n경험치: ${((exp199 / expNow) * 100).toFixed(3)}%`);
    }
}
