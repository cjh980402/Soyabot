const probTable = {
    스윗: {
        '은하': 960,
        '하랑': 960,
        '랑월': 960,
        '눈냥냥': 960,
        '토냥냥': 960,
        '판냥냥': 960,
        '리틀 울프룻': 960,
        '리틀 무토': 960,
        '리틀 램나나': 960,
        '[루나 쁘띠] 쁘띠 초롱': 388,
        '[루나 쁘띠] 신야': 388,
        '[루나 쁘띠] 황혼': 388,
        '루나 크리스탈 키': 196
    },
    드림: {
        '은하': 840,
        '하랑': 840,
        '랑월': 840,
        '눈냥냥': 840,
        '토냥냥': 840,
        '판냥냥': 840,
        '리틀 울프룻': 840,
        '리틀 무토': 840,
        '리틀 램나나': 840,
        '[루나 쁘띠] 쁘띠 초롱': 680,
        '[루나 쁘띠] 신야': 680,
        '[루나 쁘띠] 황혼': 680,
        '루나 크리스탈 키': 400
    }
};

module.exports = {
    usage: `${client.prefix}루나크리스탈 (카테고리) (횟수)`,
    command: ['루나크리스탈', 'ㄹㄴㅋㄹㅅㅌ', 'ㄹㄴㅋㄽㅌ'],
    description: `- 카테고리(스윗, 드림)와 1 ~ 20000 범위의 횟수를 입력하면 그만큼의 루나크리스탈 시뮬을 수행합니다.\n- 참고. ${client.prefix}루나크리스탈 (카테고리) 확률`,
    type: ['메이플'],
    async messageExecute(message, args) {
        if (args.length > 2 || !probTable[args[0]]) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const category = args[0];
        if (args[1] === '확률' || args[1] === 'ㅎㄹ') {
            let rslt = `<루나크리스탈 ${category} 확률>`;
            for (const key in probTable[category]) {
                rslt += `\n${key}: ${probTable[category][key] / 100}%`;
            }
            return message.channel.send(rslt);
        }

        const count = Math.trunc(args[1] ?? 1);
        if (isNaN(count) || count < 1 || count > 20000) {
            return message.channel.send('1 ~ 20000 범위의 숫자만 입력가능합니다.');
        }

        // category는 루나크리스탈 종류, count는 루나크리스탈 횟수
        // random은 0이상 1미만
        const list = {}; // 횟수 담을 객체
        const probSum = Object.values(probTable[category]).reduce((acc, cur) => acc + cur); // 확률표의 확률값의 합

        for (let i = 0; i < count; i++) {
            const now = Math.floor(Math.random() * probSum + 1);
            let sum = 0;
            for (const key in probTable[category]) {
                sum += probTable[category][key];
                if (now <= sum) {
                    list[key] = (list[key] ?? 0) + 1;
                    break;
                }
            }
        }

        let rslt = `루나크리스탈 ${category} ${count}회 결과\n`;
        for (const key in probTable[category]) {
            if (list[key]) {
                rslt += `\n${key}: ${list[key]}회`;
            }
        }
        return message.channel.send(rslt);
    },
    commandData: {
        name: '루나크리스탈',
        description: `카테고리(스윗, 드림)와 1 ~ 20000 범위의 횟수를 입력하면 그만큼의 루나크리스탈 시뮬을 수행합니다.(참고. ${client.prefix}루나크리스탈 (카테고리) 확률)`,
        options: [
            {
                name: '카레고리',
                type: 'STRING',
                description: '시뮬레이션을 수행할 루나크리스탈 카테고리',
                required: true,
                choices: ['스윗', '드림'].map((v) => ({ name: v, value: v }))
            },
            {
                name: '횟수',
                type: 'STRING',
                description: '루나크리스탈 시뮬레이션 횟수',
                required: true
            }
        ]
    },
    async commandExecute(interaction) {
        const args = interaction.options.data.map((v) => v.value);

        const category = args[0];
        if (args[1] === '확률' || args[1] === 'ㅎㄹ') {
            let rslt = `<루나크리스탈 ${category} 확률>`;
            for (const key in probTable[category]) {
                rslt += `\n${key}: ${probTable[category][key] / 100}%`;
            }
            return interaction.followUp(rslt);
        }

        const count = Math.trunc(args[1] ?? 1);
        if (isNaN(count) || count < 1 || count > 20000) {
            return interaction.followUp('1 ~ 20000 범위의 숫자만 입력가능합니다.');
        }

        // category는 루나크리스탈 종류, count는 루나크리스탈 횟수
        // random은 0이상 1미만
        const list = {}; // 횟수 담을 객체
        const probSum = Object.values(probTable[category]).reduce((acc, cur) => acc + cur); // 확률표의 확률값의 합

        for (let i = 0; i < count; i++) {
            const now = Math.floor(Math.random() * probSum + 1);
            let sum = 0;
            for (const key in probTable[category]) {
                sum += probTable[category][key];
                if (now <= sum) {
                    list[key] = (list[key] ?? 0) + 1;
                    break;
                }
            }
        }

        let rslt = `루나크리스탈 ${category} ${count}회 결과\n`;
        for (const key in probTable[category]) {
            if (list[key]) {
                rslt += `\n${key}: ${list[key]}회`;
            }
        }
        return interaction.followUp(rslt);
    }
};
