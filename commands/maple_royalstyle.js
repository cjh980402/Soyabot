const probTable = {
    '[스페셜 라벨] 신비한 패밀리어': 25,
    '[스페셜 라벨] 신비한 마을': 30,
    '[스페셜 라벨] 신비한 걸음': 32,
    '[스페셜 라벨] 신비한 주인': 32,
    '[스페셜 라벨] 신비한 모자': 31,
    '별나비(보석별) 마녀 모자': 50,
    '아이돌 링캡': 20,
    '블랙(화이트) 이어 마이크': 15,
    '눈부신(찬란한)': 20,
    '아이돌 스파클': 30,
    '가벼운 스텝': 50,
    '첫번째 팬미팅': 40,
    '반짝반짝 크라운': 50,
    '내가 바로 할로킹(할로퀸)': 35,
    '폭신폭신 망토': 50,
    '할로킹 구두': 50,
    '파티의 왕홀': 40,
    '개인정보 보호막대': 50,
    '꼬마 눈사람': 50,
    '구름 교도소': 50,
    '다크 슬레이트 진': 50,
    '[30일]수묵화 말풍선반지 교환권': 50,
    '[30일]수묵화 명찰반지 교환권': 50,
    '그림자 나무 꽃': 50,
    '스카우터': 50
};

export const usage = `${client.prefix}로얄 (횟수)`;
export const command = ['로얄', 'ㄹㅇ'];
export const description = `- 1 ~ 20000 범위의 횟수를 입력하면 그만큼의 로얄스타일 시뮬을 수행합니다.\n- 참고. ${client.prefix}로얄 확률`;
export const type = ['메이플'];
export async function messageExecute(message, args) {
    if (args.length > 1) {
        return message.channel.send(
            `**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`
        );
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
