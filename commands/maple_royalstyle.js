const proper = {
    "[스페셜 라벨] 오래된 비밀": 25,
    "[스페셜 라벨] 서고의 부름": 30,
    "[스페셜 라벨] 은밀한 인도": 32,
    "[스페셜 라벨] 서고 후계자(계승자)": 32,
    "[스페셜 라벨] 해박한(드높은) 지성": 31,
    "흑단운(흑단향)": 50,
    "흑단 비호(수호)": 20,
    "흑단 부채": 25,
    "흑단 가죽신(비단신)": 50,
    "몽글 딸기": 50,
    "몽글 딸기 소년(소녀)": 35,
    "몽글 딸기 포크": 40,
    "몽글 딸기 장화": 50,
    "무영도": 15,
    "흑월(백월)": 20,
    "낭만방랑": 50,
    "낭만협객": 45,
    "협객걸음": 50,
    "호신단도": 50,
    "너구리털 귀마개": 50,
    "순금 태엽인형": 50,
    "[30일]꿈속의 설경 말풍선반지 교환권": 50,
    "[30일]꿈속의 설경 명찰반지 교환권": 50,
    "흑단나무 의자": 50,
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
        const propsum = Object.values(proper[gender]).reduce((acc, cur) => acc + cur); // 확률표의 확률값의 합

        for (let i = 0; i < count; i++) {
            const now = Math.floor(Math.random() * propsum + 1);
            let sum = 0;
            for (let key in proper) {
                sum += proper[key];
                if (now <= sum) {
                    list[key] = (list[key] ?? 0) + 1;
                    break;
                }
            }
        }

        let rslt = `로얄 ${count}회 결과\n`;
        for (let key in proper) {
            if (list[key]) {
                rslt += `\n${key}: ${list[key]}회`;
            }
        }
        return message.channel.send(rslt);
    }
};