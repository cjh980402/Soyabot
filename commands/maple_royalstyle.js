const probTable = {
    "[스페셜 라벨] 피어난 이슬": 25,
    "[스페셜 라벨] 이슬샘 요정": 30,
    "[스페셜 라벨] 샘의 풀꽃": 32,
    "[스페셜 라벨] 샘의 이슬(꽃잎)": 32,
    "[스페셜 라벨] 샘의 보석": 31,
    "꽃망울 모자": 50,
    "낭만 동글이 안경": 20,
    "얌얌(냠냠) 타임": 20,
    "얌냠 핫도그": 40,
    "얌냠 리본": 50,
    "얌냠 헤어밴드": 50,
    "얌냠 운동화": 50,
    "병아리떼 쫑쫑쫑": 30,
    "오르카 잠옷 후디": 35,
    "오르카 잠옷": 15,
    "오르카 졸려": 40,
    "꿈 속의 꿈": 50,
    "무지개 홍조": 50,
    "알록달록 블루 팬츠": 50,
    "딸기셔츠": 50,
    "파스텔 도트티": 50,
    "[30일] 병아리 말풍선반지 교환권": 50,
    "[30일] 병아리 명찰반지 교환권": 50,
    "봄의 낭만 카페": 50,
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