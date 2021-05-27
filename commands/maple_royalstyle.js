const probTable = {
    '[스페셜 라벨] 퓨어 로즈 머들러': 25,
    '[스페셜 라벨] 퓨어 딜라이트': 30,
    '[스페셜 라벨] 애플(베리) 브리즈': 32,
    '[스페셜 라벨] 실론(다즐링) 티타임': 32,
    '[스페셜 라벨] 로즈 블렌딩': 31,
    '동글(퐁퐁) 도넛 머리띠': 15,
    '도넛 쇼핑백': 50,
    '사르르 도넛': 30,
    '도넛 파티': 50,
    '퐁당 핑크 도넛': 15,
    '달콤(상큼) 펭귄 후드': 45,
    '달콤(상큼) 펭귄 인형옷': 25,
    '달콤(상큼) 펭귄 아이스': 50,
    '달콤(상큼) 펭귄 장갑': 20,
    '상큼 달콤 펭귄즈': 50,
    '동글 홍조': 50,
    '레드 드레시 리본': 50,
    '어깨 위 블랑슈': 50,
    '엔젤윙 슈즈': 50,
    '노을다솜 반팔티': 50,
    '핫핑크 멜빵바지': 50,
    '[30일] 벚꽃 말풍선반지 교환권': 50,
    '[30일] 벚꽃 명찰반지 교환권': 50,
    '피어라 봄꽃 이펙트 교환권': 50,
    '스카우터': 50
};

module.exports = {
    usage: `${client.prefix}로얄 (횟수)`,
    command: ['로얄', 'ㄹㅇ'],
    description: `- 1 ~ 20000 범위의 횟수를 입력하면 그만큼의 로얄스타일 시뮬을 수행합니다.\n- 참고. ${client.prefix}로얄 확률`,
    type: ['메이플'],
    async execute(message, args) {
        if (args.length > 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        if (args[0] == '확률' || args[0] == 'ㅎㄹ') {
            let rslt = '<로얄스타일 확률>';
            for (let key in probTable) {
                rslt += `\n${key}: ${probTable[key] / 10}%`;
            }
            return message.channel.send(rslt);
        }

        const count = +(args[0] ?? 1);
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
            for (let key in probTable) {
                sum += probTable[key];
                if (now <= sum) {
                    list[key] = (list[key] ?? 0) + 1;
                    break;
                }
            }
        }

        let rslt = `로얄 ${count}회 결과\n`;
        for (let key in probTable) {
            if (list[key]) {
                rslt += `\n${key}: ${list[key]}회`;
            }
        }
        return message.channel.send(rslt);
    }
};
