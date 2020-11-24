const proper = {
    "스윗": {
        "블랑": 960,
        "프림": 960,
        "눈동": 960,
        "초용": 960,
        "뽀용": 960,
        "파용": 960,
        "초크삐": 960,
        "블루삐": 960,
        "체리삐": 960,
        "[루나 쁘띠] 쁘띠 초롱": 388,
        "[루나 쁘띠] 신야": 388,
        "[루나 쁘띠] 황혼": 388,
        "루나 크리스탈 키": 196
    },
    "드림": {
        "블랑": 840,
        "프림": 840,
        "눈동": 840,
        "초용": 840,
        "뽀용": 840,
        "파용": 840,
        "초크삐": 840,
        "블루삐": 840,
        "체리삐": 840,
        "[루나 쁘띠] 쁘띠 초롱": 680,
        "[루나 쁘띠] 신야": 680,
        "[루나 쁘띠] 황혼": 680,
        "루나 크리스탈 키": 400
    }
}

module.exports = {
    usage: `${client.prefix}루나크리스탈 (카테고리) (횟수)`,
    command: ["루나크리스탈", "ㄹㄴㅋㄹㅅㅌ", "ㄹㄴㅋㄽㅌ"],
    description: `- 카테고리(스윗, 드림)와 1 ~ 20000 범위의 횟수를 입력하면 그만큼의 루나크리스탈 시뮬을 수행합니다.\n- 참고. ${client.prefix}루나크리스탈 (카테고리) 확률`,
    type: ["메이플"],
    async execute(message, args) {
        if (args.length != 2 || !proper[args[0]]) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        if (args[1] == '확률' || args[1] == 'ㅎㄹ') {
            let rslt = `<루나크리스탈 ${args[0]} 확률>\n`;
            for (let key in proper[args[0]]) {
                rslt += `${key}: ${proper[args[0]][key] / 100}%\n`;
            }
            return message.channel.send(rslt.trimEnd());
        }
        if (+args[1] < 1 || +args[1] > 20000 || isNaN(args[1])) {
            return message.channel.send('1 ~ 20000 범위의 숫자만 입력가능합니다.');
        }

        // args[0]은 루나크리스탈 종류, args[1]은 루나크리스탈 횟수
        // random은 0이상 1미만
        const list = {}; // 횟수 담을 객체
        let propsum = 0; // 확률표의 확률값의 합
        for (let key in proper[args[0]]) {
            list[key] = 0;
            propsum += proper[args[0]][key];
        }
        for (let i = 0; i < +args[1]; i++) {
            const now = Math.floor(Math.random() * propsum + 1);
            let sum = 0;
            for (let key in proper[args[0]]) {
                sum += proper[args[0]][key];
                if (now <= sum) {
                    list[key]++;
                    break;
                }
            }
        }

        let rslt = `루나크리스탈 ${args[0]} ${args[1]}회 결과\n\n`;
        for (let key in list) {
            if (list[key] != 0) {
                rslt += `${key}: ${list[key]}회\n`;
            }
        }
        return message.channel.send(rslt.trimEnd());
    }
};