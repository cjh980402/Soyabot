const probTable = {
    '[스페셜 라벨] 매혹의 향기': 25,
    '[스페셜 라벨] 머무는 향기': 30,
    '[스페셜 라벨] 조향사 로퍼(구두)': 32,
    '[스페셜 라벨] 조향사 아로마(하모니)': 32,
    '[스페셜 라벨] 블랙 머스크(바닐라) 리본': 31,
    '설야의 어둠(새벽)': 50,
    '고독한(그리운) 설야': 30,
    '설야의 흑호': 35,
    '설야의 문장': 40,
    '설야의 부츠(구두)': 50,
    '언더테이커': 15,
    '붕대 눈가리개 블랙': 20,
    '한밤의 검은 관': 30,
    '한밤의 검은 고양이': 50,
    '블랙(화이트) 벙거지': 50,
    '스포티룩 한벌옷': 40,
    '달별 백팩': 40,
    '시크릿 패스포트': 50,
    '인형 라벤더': 50,
    '저요 핑크빈': 50,
    '핑크빈 슬리퍼': 50,
    '[30일]꿈속의 설경 말풍선반지 교환권': 50,
    '[30일]꿈속의 설경 명찰반지 교환권': 50,
    '눈수정 마을': 50,
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
