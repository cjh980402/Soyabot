import { MapleProb } from '../util/maple_probtable.js';

export const usage = `${client.prefix}루나크리스탈 (카테고리) (횟수)`;
export const command = ['루나크리스탈', 'ㄹㄴㅋㄹㅅㅌ', 'ㄹㄴㅋㄽㅌ'];
export const description = `- 카테고리(스윗, 드림)와 1 ~ 20000 범위의 횟수를 입력하면 그만큼의 루나크리스탈 시뮬을 수행합니다.\n- 참고. ${client.prefix}루나크리스탈 (카테고리) 확률`;
export const type = ['메이플'];
export async function messageExecute(message, args) {
    if (args.length > 2 || !MapleProb.LUNACRYSTAL_PROBTABLE[args[0]]) {
        return message.channel.send(`**${usage}**\n- 대체 명령어: ${command.join(', ')}\n${description}`);
    }

    const category = args[0];
    if (args[1] === '확률' || args[1] === 'ㅎㄹ') {
        let rslt = `<루나크리스탈 ${category} 확률>`;
        for (const key in MapleProb.LUNACRYSTAL_PROBTABLE[category]) {
            rslt += `\n${key}: ${MapleProb.LUNACRYSTAL_PROBTABLE[category][key] / 100}%`;
        }
        return message.channel.send(rslt);
    }

    const count = Math.trunc(args[1] ?? 1);
    if (isNaN(count) || count < 1 || count > 20000) {
        return message.channel.send('1 ~ 20000 범위의 숫자만 입력가능합니다.');
    }

    // category는 루나크리스탈 종류, count는 루나크리스탈 횟수
    // random은 0이상 1미만
    const list = {}; // 횟수 담을 객체
    const probSum = Object.values(MapleProb.LUNACRYSTAL_PROBTABLE[category]).reduce((acc, cur) => acc + cur); // 확률표의 확률값의 합

    for (let i = 0; i < count; i++) {
        const now = Math.floor(Math.random() * probSum + 1);
        let sum = 0;
        for (const key in MapleProb.LUNACRYSTAL_PROBTABLE[category]) {
            sum += MapleProb.LUNACRYSTAL_PROBTABLE[category][key];
            if (now <= sum) {
                list[key] = (list[key] ?? 0) + 1;
                break;
            }
        }
    }

    let rslt = `루나크리스탈 ${category} ${count}회 결과\n`;
    for (const key in MapleProb.LUNACRYSTAL_PROBTABLE[category]) {
        if (list[key]) {
            rslt += `\n${key}: ${list[key]}회`;
        }
    }
    return message.channel.send(rslt);
}
export const commandData = {
    name: '루나크리스탈',
    description: `카테고리(스윗, 드림)와 1 ~ 20000 범위의 횟수를 입력하면 그만큼의 루나크리스탈 시뮬을 수행합니다.(참고. ${client.prefix}루나크리스탈 (카테고리) 확률)`,
    options: [
        {
            name: '카테고리',
            type: 'STRING',
            description: '시뮬레이션을 수행할 루나크리스탈 카테고리',
            required: true,
            choices: Object.keys(MapleProb.LUNACRYSTAL_PROBTABLE).map((v) => ({ name: v, value: v }))
        },
        {
            name: '횟수',
            type: 'STRING',
            description: '루나크리스탈 시뮬레이션 횟수'
        }
    ]
};
export async function commandExecute(interaction) {
    const category = interaction.options.getString('카테고리');
    const countString = interaction.options.getString('횟수');

    if (countString === '확률' || countString === 'ㅎㄹ') {
        let rslt = `<루나크리스탈 ${category} 확률>`;
        for (const key in MapleProb.LUNACRYSTAL_PROBTABLE[category]) {
            rslt += `\n${key}: ${MapleProb.LUNACRYSTAL_PROBTABLE[category][key] / 100}%`;
        }
        return interaction.followUp(rslt);
    }

    const count = Math.trunc(countString ?? 1);
    if (isNaN(count) || count < 1 || count > 20000) {
        return interaction.followUp('1 ~ 20000 범위의 숫자만 입력가능합니다.');
    }

    // category는 루나크리스탈 종류, count는 루나크리스탈 횟수
    // random은 0이상 1미만
    const list = {}; // 횟수 담을 객체
    const probSum = Object.values(MapleProb.LUNACRYSTAL_PROBTABLE[category]).reduce((acc, cur) => acc + cur); // 확률표의 확률값의 합

    for (let i = 0; i < count; i++) {
        const now = Math.floor(Math.random() * probSum + 1);
        let sum = 0;
        for (const key in MapleProb.LUNACRYSTAL_PROBTABLE[category]) {
            sum += MapleProb.LUNACRYSTAL_PROBTABLE[category][key];
            if (now <= sum) {
                list[key] = (list[key] ?? 0) + 1;
                break;
            }
        }
    }

    let rslt = `루나크리스탈 ${category} ${count}회 결과\n`;
    for (const key in MapleProb.LUNACRYSTAL_PROBTABLE[category]) {
        if (list[key]) {
            rslt += `\n${key}: ${list[key]}회`;
        }
    }
    return interaction.followUp(rslt);
}
