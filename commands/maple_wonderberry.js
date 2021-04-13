const probTable = {
    '[원더블랙] 눈냥냥': 332,
    '[원더블랙] 토냥냥': 332,
    '[원더블랙] 판냥냥': 332,
    '붕어빵단팥이': 1200,
    '붕어빵크림이': 1200,
    '붕어빵탄이': 1200,
    '식빵이': 1200,
    '마롱이': 1200,
    '고농축 프리미엄 생명의 물': 1502,
    '오가닉 원더 쿠키': 1502
};

module.exports = {
    usage: `${client.prefix}원더베리 (횟수)`,
    command: ['원더베리', 'ㅇㄷㅂㄹ', '원기베리', 'ㅇㄱㅂㄹ'],
    description: `- 1 ~ 20000 범위의 횟수를 입력하면 그만큼의 원더베리 시뮬을 수행합니다.\n- 참고. ${client.prefix}원더베리 확률`,
    type: ['메이플'],
    async execute(message, args) {
        if (args.length > 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        if (args[0] == '확률' || args[0] == 'ㅎㄹ') {
            let rslt = '<원더베리 확률>';
            for (let key in probTable) {
                rslt += `\n${key}: ${probTable[key] / 100}%`;
            }
            return message.channel.send(rslt);
        }

        const count = +(args[0] ?? 1);
        if (isNaN(count) || count < 1 || count > 20000) {
            return message.channel.send('1 ~ 20000 범위의 숫자만 입력가능합니다.');
        }

        // count는 원더베리 횟수
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

        let rslt = `원더베리 ${count}회 결과\n`;
        for (let key in probTable) {
            if (list[key]) {
                rslt += `\n${key}: ${list[key]}회`;
            }
        }
        return message.channel.send(rslt);
    }
};
