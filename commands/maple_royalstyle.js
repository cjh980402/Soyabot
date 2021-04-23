const probTable = {
    '[스페셜 라벨] 마스코트 블랑': 25,
    '[스페셜 라벨] 블랙캣 크로스백': 30,
    '[스페셜 라벨] 블랙캣 슈즈': 32,
    '[스페셜 라벨] 블랙캣 유니폼': 32,
    '[스페셜 라벨] 블랙캣 고글': 31,
    '검은 침묵': 15,
    '스윗레터 소년(소녀)': 15,
    '스윗레터 햇(리본)': 50,
    '스윗레터 만년필': 40,
    '스윗레터 잉크': 50,
    '스윗레터 로퍼': 50,
    '봄빛 우비': 15,
    '봄빛 우비모자': 30,
    '봄비가 똑똑똑': 50,
    '쁘띠 봄빛 우비': 40,
    '봄빛 우비장화': 50,
    '자체발광': 50,
    '밤비니 윙즈': 45,
    '캔디파티 리본 머리핀': 50,
    '비바 베이스볼 블랙': 50,
    '알록달록 블루 팬츠': 50,
    '[30일] 스윗레터 말풍선반지 교환권': 50,
    '[30일] 스윗레터 명찰반지 교환권': 50,
    '고양이와 나': 50,
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
