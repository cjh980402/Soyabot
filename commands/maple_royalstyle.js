const proper = {
    "[스페셜 라벨] 실버벨": 25,
    "[스페셜 라벨] 실버 드림": 30,
    "[스페셜 라벨] 미니벨 체인": 32,
    "[스페셜 라벨] 실버 엔젤": 32,
    "[스페셜 라벨] 실버 하모니": 31,
    "다람곰 탐험단 고글": 50,
    "다람곰 탐험단 캡": 50,
    "다람곰 소년(소녀) 단원": 20,
    "다람곰 카메라": 30,
    "다람곰 탐험단 배낭": 50,
    "다람곰 탐험단 구두": 50,
    "칠흑의 날개 모자": 35,
    "칠흑의 날개 코트": 20,
    "칠흑의 날개": 15,
    "칠흑의 날개 신발": 50,
    "인형 라벤더": 30,
    "보라색 장미의 사람": 50,
    "반짝이 겨울핀(겨울리본)": 50,
    "두근두근 스키니": 50,
    "화이트 체리 니트": 50,
    "기억 잃은 외계인": 50,
    "[30일] 매화 말풍선반지 교환권": 50,
    "[30일] 매화 명찰반지 교환권": 50,
    "멍멍이 텐트 의자": 50,
    "스카우터": 50
}

module.exports = {
    usage: `${client.prefix}로얄 (횟수)`,
    command: ["로얄", "ㄹㅇ"],
    description: `- 1 ~ 20000 범위의 횟수를 입력하면 그만큼의 로얄스타일 시뮬을 수행합니다.\n- 참고. ${client.prefix}로얄 확률`,
    type: ["메이플"],
    async execute(message, args) {
        if (args.length > 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        if (args[0] == '확률' || args[0] == 'ㅎㄹ') {
            let rslt = '<로얄스타일 확률>';
            for (let key in proper) {
                rslt += `\n${key}: ${proper[key] / 10}%`;
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
        let propsum = 0; // 확률표의 확률값의 합
        for (let key in proper) {
            list[key] = 0;
            propsum += proper[key];
        }
        for (let i = 0; i < count; i++) {
            const now = Math.floor(Math.random() * propsum + 1);
            let sum = 0;
            for (let key in proper) {
                sum += proper[key];
                if (now <= sum) {
                    list[key]++;
                    break;
                }
            }
        }

        let rslt = `로얄 ${count}회 결과\n`;
        for (let key in list) {
            if (list[key] != 0) {
                rslt += `\n${key}: ${list[key]}회`;
            }
        }
        return message.channel.send(rslt);
    }
};