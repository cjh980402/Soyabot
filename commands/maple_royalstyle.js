const probTable = {
    '[스페셜 라벨] 장난감 마술봉': 25,
    '[스페셜 라벨] 장난감 키링': 30,
    '[스페셜 라벨] 장난감 로퍼(구두)': 32,
    '[스페셜 라벨] 장난감의 시간(추억))': 32,
    '[스페셜 라벨] 장난감 프로펠러': 31,
    '손뜨개 머리핀(똑딱핀)': 50,
    '백일몽 리본': 30,
    '한밤의(한낮의) 꿈': 15,
    '외로운 꼬마곰': 35,
    '백일몽 구두': 50,
    '랄랄라 메가폰': 35,
    '애옹이 인형모자': 50,
    '애옹이 스카프 인형옷': 20,
    '애옹이 스카프 장갑': 30,
    '애옹이 도시락': 35,
    '애옹이 보따리': 50,
    '딸기 생크림': 50,
    '데굴데굴 친구들': 50,
    '블루 야구모자': 50,
    '새기 팬츠': 50,
    '체리 래빗 후드': 50,
    '[30일] 데스티니 말풍선반지 교환권': 50,
    '[30일] 데스티니 명찰반지 교환권': 50,
    '어느 맑은날': 50,
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
