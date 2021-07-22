const probTable = {
    '[스페셜 라벨] 진주빛 기억': 25,
    '[스페셜 라벨] 블루밍 버블': 30,
    '[스페셜 라벨] 설레는 시작': 32,
    '[스페셜 라벨] 파란 물보라(물결)': 32,
    '[스페셜 라벨] 블루밍 오션': 31,
    '헤네시스 나들이': 30,
    '쫑긋 헤네시스': 45,
    '헤네시스 채집가': 50,
    '버섯의 노래': 50,
    '꿈꾸는 오솔길': 50,
    '발그레 발그레': 15,
    '토끼 귀': 20,
    '퍼니펀치 요요': 20,
    '특대 사이즈 와이셔츠': 20,
    '핑크 다이빙 마스크': 50,
    '스카이 다이빙 마스크': 50,
    '스카이(핑크) 스쿠버다이빙': 50,
    '뽀그리 오리': 50,
    '짝짝이 반바지': 50,
    '그린 냥이 티셔츠': 50,
    '트윙클 글리터': 50,
    '[30일]꽥꽥 오리 말풍선반지 교환권': 50,
    '[30일]꽥꽥 오리 명찰반지 교환권': 50,
    'new 파도가 철썩! 이펙트 교환권': 50,
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
        if (args[0] === '확률' || args[0] === 'ㅎㄹ') {
            let rslt = '<로얄스타일 확률>';
            for (let key in probTable) {
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
