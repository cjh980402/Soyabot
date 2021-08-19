const probTable = {
    '[스페셜 라벨] 해바라기 큰송이': 25,
    '[스페셜 라벨] 해바라기 꽃비': 30,
    '[스페셜 라벨] 해바라기 꽃신': 32,
    '[스페셜 라벨] 해바라기 해변가(해안가)': 32,
    '[스페셜 라벨] 해바라기 꽃모자(꽃핀)': 31,
    '상큼 복숭아': 35,
    '복숭아 젤리': 20,
    '퐁퐁 복숭아': 50,
    '납작 복숭아': 40,
    '복숭아 신발': 50,
    '하트 콩콩': 50,
    '커스드 헌터 후드': 35,
    '커스드 헌터': 35,
    '커스드 헌터 망토': 15,
    '커스드 보우': 40,
    '커스드 헌터 신발': 50,
    '전설의 어인': 30,
    '로맨틱 LED 선글라스': 50,
    '미니바니 팬츠': 50,
    '냐옹냐옹 티셔츠': 50,
    '살려줘요 상어님': 50,
    '[30일] 복숭아 말풍선반지 교환권': 50,
    '[30일] 복숭아 명찰반지 교환권': 50,
    '퐁당 유리 화채 의자': 50,
    '스카우터': 50
};

module.exports = {
    usage: `${client.prefix}로얄 (횟수)`,
    command: ['로얄', 'ㄹㅇ'],
    description: `- 1 ~ 20000 범위의 횟수를 입력하면 그만큼의 로얄스타일 시뮬을 수행합니다.\n- 참고. ${client.prefix}로얄 확률`,
    type: ['메이플'],
    async messageExecute(message, args) {
        if (args.length > 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        if (args[0] === '확률' || args[0] === 'ㅎㄹ') {
            let rslt = '<로얄스타일 확률>';
            for (const key in probTable) {
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
            for (const key in probTable) {
                sum += probTable[key];
                if (now <= sum) {
                    list[key] = (list[key] ?? 0) + 1;
                    break;
                }
            }
        }

        let rslt = `로얄 ${count}회 결과\n`;
        for (const key in probTable) {
            if (list[key]) {
                rslt += `\n${key}: ${list[key]}회`;
            }
        }
        return message.channel.send(rslt);
    },
    commandData: {
        name: '로얄',
        description: `1 ~ 20000 범위의 횟수를 입력하면 그만큼의 로얄스타일 시뮬을 수행합니다.(참고. ${client.prefix}로얄 확률)`,
        options: [
            {
                name: '횟수',
                type: 'STRING',
                description: '로얄스타일 시뮬레이션 횟수'
            }
        ]
    },
    async commandExecute(interaction) {
        const countString = interaction.options.getString('횟수');

        if (countString === '확률' || countString === 'ㅎㄹ') {
            let rslt = '<로얄스타일 확률>';
            for (const key in probTable) {
                rslt += `\n${key}: ${probTable[key] / 10}%`;
            }
            return interaction.followUp(rslt);
        }

        const count = Math.trunc(countString ?? 1);
        if (isNaN(count) || count < 1 || count > 20000) {
            return interaction.followUp('1 ~ 20000 범위의 숫자만 입력가능합니다.');
        }

        // count는 로얄 횟수
        // random은 0이상 1미만
        const list = {}; // 횟수 담을 객체
        const propsum = Object.values(probTable).reduce((acc, cur) => acc + cur); // 확률표의 확률값의 합

        for (let i = 0; i < count; i++) {
            const now = Math.floor(Math.random() * propsum + 1);
            let sum = 0;
            for (const key in probTable) {
                sum += probTable[key];
                if (now <= sum) {
                    list[key] = (list[key] ?? 0) + 1;
                    break;
                }
            }
        }

        let rslt = `로얄 ${count}회 결과\n`;
        for (const key in probTable) {
            if (list[key]) {
                rslt += `\n${key}: ${list[key]}회`;
            }
        }
        return interaction.followUp(rslt);
    }
};
