const proper = {
    "[스페셜 라벨] 따스한 마음": 25,
    "[스페셜 라벨] 따스한 설렘": 30,
    "[스페셜 라벨] 따스한 구두": 32,
    "[스페셜 라벨] 따스한 기다림(그리움)": 32,
    "[스페셜 라벨] 따스한 분홍": 31,
    "니트 리본": 50,
    "갈색(남색) 별자수 니트": 20,
    "별자수 워커": 50,
    "대왕 붕어빵": 50,
    "냠냠 붕어빵": 20,
    "붕어빵 봉투": 35,
    "단팥 붕어빵": 40,
    "개구디노 모자": 30,
    "개구디노 한벌옷": 15,
    "개구디노 신발": 50,
    "개구디노": 40,
    "개구디노 장갑": 50,
    "캔디파티 리본": 50,
    "시끌시끌": 50,
    "카키 야상코트": 50,
    "도너츠 안경": 50,
    "[30일]수묵화 말풍선반지 교환권": 50,
    "[30일]수묵화 명찰반지 교환권": 50,
    "폭신동글 눈토끼 의자": 50,
    "스카우터": 50
}

module.exports = {
    usage: `${client.prefix}로얄 (횟수)`,
    command: ["로얄", "ㄹㅇ"],
    description: `- 1 ~ 20000 범위의 횟수를 입력하면 그만큼의 로얄스타일 시뮬을 수행합니다.\n- 참고. ${client.prefix}로얄 확률`,
    type: ["메이플"],
    async execute(message, args) {
        if (args.length != 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        if (args[0] == '확률' || args[0] == 'ㅎㄹ') {
            let rslt = '<로얄스타일 확률>\n';
            for (let key in proper) {
                rslt += `${key}: ${proper[key] / 10}%\n`;
            }
            return message.channel.send(rslt.trimEnd());
        }
        if (+args[0] < 1 || +args[0] > 20000 || isNaN(args[0])) {
            return message.channel.send('1 ~ 20000 범위의 숫자만 입력가능합니다.');
        }

        // args[0]은 로얄 횟수
        // random은 0이상 1미만
        const list = {}; // 횟수 담을 객체
        let propsum = 0; // 확률표의 확률값의 합
        for (let key in proper) {
            list[key] = 0;
            propsum += proper[key];
        }
        for (let i = 0; i < +args[0]; i++) {
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

        let rslt = `로얄 ${args[0]}회 결과\n\n`;
        for (let key in list) {
            if (list[key] != 0) {
                rslt += `${key}: ${list[key]}회\n`;
            }
        }
        return message.channel.send(rslt.trimEnd());
    }
};