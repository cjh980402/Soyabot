const probTable = {
    '[스페셜 라벨] 오르골의 열쇠': 25,
    '[스페셜 라벨] 환상 태엽': 30,
    '[스페셜 라벨] 환상 음계': 32,
    '[스페셜 라벨] 환상 에스텔(에뜨왈)': 32,
    '[스페셜 라벨] 환상 음률': 31,
    '루르 드림': 20,
    '문 슬립': 50,
    '드림스타': 15,
    '미라쥬 드림': 35,
    '드림캐쳐': 50,
    '청순 은방울꽃': 50,
    '포숑 은방울꽃': 45,
    '포숑 요정 털모자': 30,
    '포숑 요정옷': 25,
    '포숑 요정구두': 50,
    '인형 보라': 50,
    '울망울망': 30,
    '로맨틱 피에스타': 50,
    '별똥별': 50,
    '쿵쿵하트 베스트': 50,
    '사파이어진': 50,
    '[30일] 파도 말풍선 반지 교환권': 50,
    '[30일] 파도 명찰 반지 교환권': 50,
    '다 내거야 의자': 50,
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
