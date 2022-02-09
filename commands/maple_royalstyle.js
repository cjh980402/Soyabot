import { MapleProb } from '../util/maple_probtable.js';

export const usage = `${client.prefix}로얄 (횟수)`;
export const command = ['로얄', 'ㄹㅇ'];
export const description = `- 1 ~ 20000 범위의 횟수를 입력하면 그만큼의 로얄스타일 시뮬을 수행합니다.\n- 참고. ${client.prefix}로얄 확률`;
export const type = ['메이플'];
export async function messageExecute(message, args) {
    if (args.length > 1) {
        return message.channel.send(`**${usage}**\n- 대체 명령어: ${command.join(', ')}\n${description}`);
    }
    if (args[0] === '확률' || args[0] === 'ㅎㄹ') {
        let rslt = '<로얄스타일 확률>';
        for (const key in MapleProb.ROYALSTYLE_PROBTABLE) {
            rslt += `\n${key}: ${MapleProb.ROYALSTYLE_PROBTABLE[key] / 10}%`;
        }
        return message.channel.send(rslt);
    }

    const count = Math.trunc(args[0] ?? 1);
    if (isNaN(count) || count < 1 || count > 20000) {
        return message.channel.send('1 ~ 20000 범위의 숫자만 입력가능합니다.');
    }

    // count는 로얄 횟수
    // random은 0이상 1미만
    const list = {}; // 횟수 담을 객체
    const propsum = Object.values(MapleProb.ROYALSTYLE_PROBTABLE).reduce((acc, cur) => acc + cur); // 확률표의 확률값의 합

    for (let i = 0; i < count; i++) {
        const now = Math.floor(Math.random() * propsum + 1);
        let sum = 0;
        for (const key in MapleProb.ROYALSTYLE_PROBTABLE) {
            sum += MapleProb.ROYALSTYLE_PROBTABLE[key];
            if (now <= sum) {
                list[key] = (list[key] ?? 0) + 1;
                break;
            }
        }
    }

    let rslt = `로얄 ${count}회 결과\n`;
    for (const key in MapleProb.ROYALSTYLE_PROBTABLE) {
        if (list[key]) {
            rslt += `\n${key}: ${list[key]}회`;
        }
    }
    return message.channel.send(rslt);
}
export const commandData = {
    name: '로얄',
    description: `1 ~ 20000 범위의 횟수를 입력하면 그만큼의 로얄스타일 시뮬을 수행합니다.(참고. ${client.prefix}로얄 확률)`,
    options: [
        {
            name: '횟수',
            type: 'STRING',
            description: '로얄스타일 시뮬레이션 횟수'
        }
    ]
};
export async function commandExecute(interaction) {
    const countString = interaction.options.getString('횟수');

    if (countString === '확률' || countString === 'ㅎㄹ') {
        let rslt = '<로얄스타일 확률>';
        for (const key in MapleProb.ROYALSTYLE_PROBTABLE) {
            rslt += `\n${key}: ${MapleProb.ROYALSTYLE_PROBTABLE[key] / 10}%`;
        }
        return interaction.followUp(rslt);
    }

    const count = Math.trunc(countString ?? 1);
    if (isNaN(count) || count < 1 || count > 20000) {
        return interaction.followUp('1 ~ 20000 범위의 숫자만 입력가능합니다.');
    }

    // count는 로얄 횟수
    // random은 0이상 1미만
    const list = {}; // 횟수 담을 객체
    const propsum = Object.values(MapleProb.ROYALSTYLE_PROBTABLE).reduce((acc, cur) => acc + cur); // 확률표의 확률값의 합

    for (let i = 0; i < count; i++) {
        const now = Math.floor(Math.random() * propsum + 1);
        let sum = 0;
        for (const key in MapleProb.ROYALSTYLE_PROBTABLE) {
            sum += MapleProb.ROYALSTYLE_PROBTABLE[key];
            if (now <= sum) {
                list[key] = (list[key] ?? 0) + 1;
                break;
            }
        }
    }

    let rslt = `로얄 ${count}회 결과\n`;
    for (const key in MapleProb.ROYALSTYLE_PROBTABLE) {
        if (list[key]) {
            rslt += `\n${key}: ${list[key]}회`;
        }
    }
    return interaction.followUp(rslt);
}
