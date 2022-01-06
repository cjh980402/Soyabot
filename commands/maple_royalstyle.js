const probTable = {
    '[스페셜 라벨] 눈꽃보송 도토리': 25,
    '[스페셜 라벨] 눈꽃보송 다람꼬리': 30,
    '[스페셜 라벨] 뽀송(달송) 다람': 32,
    '[스페셜 라벨] 뽀송(달송) 눈꽃': 32,
    '[스페셜 라벨] 눈꽃보송 머리띠': 31,
    '눈곰돌이 목도리': 20,
    '붉은 고요': 15,
    '붉은 고요 캡': 50,
    '붉은 고요 제복': 20,
    '붉은 고요 망토': 35,
    '붉은 고요 구두': 50,
    '바다의 날개(심장)': 50,
    '오 나의 선장님': 30,
    '빛의 바다': 30,
    '선장님 부츠': 50,
    '하트안대': 50,
    '어깨가 내 집': 50,
    '도토리 깍지 모자': 50,
    '아이돌 마스크 블랙(화이트)': 50,
    '무릎의 자유': 50,
    '레드체크 라이더': 50,
    '[30일] 블러드 말풍선 반지 교환권': 50,
    '[30일] 블러드 명찰 반지 교환권': 50,
    '모두 다 선장님거야 의자': 50,
    '스카우터': 50
};

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
        for (const key in probTable) {
            rslt += `\n${key}: ${probTable[key] / 10}%`;
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
    const propsum = Object.values(probTable).reduce((acc, cur) => acc + cur); // 확률표의 확률값의 합

    for (let i = 0; i < count; i++) {
        const now = Math.floor(Math.random() * propsum + 1);
        let sum = 0;
        for (const key in probTable) {
            sum += probTable[key];
            if (now <= sum) {
                list[key] = (list[key] ?? 0) + 1;
                break;
            }
        }
    }

    let rslt = `로얄 ${count}회 결과\n`;
    for (const key in probTable) {
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
        for (const key in probTable) {
            rslt += `\n${key}: ${probTable[key] / 10}%`;
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
    const propsum = Object.values(probTable).reduce((acc, cur) => acc + cur); // 확률표의 확률값의 합

    for (let i = 0; i < count; i++) {
        const now = Math.floor(Math.random() * propsum + 1);
        let sum = 0;
        for (const key in probTable) {
            sum += probTable[key];
            if (now <= sum) {
                list[key] = (list[key] ?? 0) + 1;
                break;
            }
        }
    }

    let rslt = `로얄 ${count}회 결과\n`;
    for (const key in probTable) {
        if (list[key]) {
            rslt += `\n${key}: ${list[key]}회`;
        }
    }
    return interaction.followUp(rslt);
}
