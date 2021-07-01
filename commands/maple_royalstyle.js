const probTable = {
    '[스페셜 라벨] 푸른 밤 베레모': 31,
    '[스페셜 라벨] 푸른 별자리': 30,
    '[스페셜 라벨] 푸른 밤 산책': 32,
    '[스페셜 라벨] 별빛 연구원(연구가)': 32,
    '[스페셜 라벨] 푸른 밤 별빛': 25,
    '속죄의 진혼 로브': 15,
    '속죄의 진혼': 35,
    '레퀴엠': 30,
    '속죄의 걸음': 50,
    '포근 졸려': 15,
    '단잠(낮잠) 리본': 35,
    '포근냥 쿠션': 30,
    '포근 단잠(낮잠)': 40,
    '포근 실내화': 50,
    '헤어롤': 50,
    '순수 날개': 50,
    '마린 티니아 쉐이드': 50,
    '두근두근쿵쿵': 50,
    '호루라기': 50,
    '핑크바니 스웨터': 50,
    '핑핑하트 스키니': 50,
    '[30일] 포근냥 명찰반지 교환권': 50,
    '[30일] 포근냥 말풍선반지 교환권': 50,
    '시원해 냉장고': 50,
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
