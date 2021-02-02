const proper = {
    "남": {
        "산구름 헤어": 10,
        "포근곱슬 헤어": 15,
        "미로 헤어": 15,
        "소이 헤어": 20,
        "나이트 헤어": 20,
        "허리케인 헤어": 20
    },
    "여": {
        "하리화 헤어": 10,
        "꼬마야 헤어": 15,
        "델핀 헤어": 15,
        "미나 헤어": 20,
        "단아 헤어": 20,
        "뮤즈 헤어": 20
    }
}

module.exports = {
    usage: `${client.prefix}헤어 (성별) (목표 헤어 이름)`,
    command: ["헤어", "ㅎㅇ"],
    description: `- 해당 성별의 목표 헤어를 얻을 때까지 로얄 헤어 시뮬을 수행합니다.
- 적용 중인 헤어가 목록에 존재할 경우 나머지 헤어만 뜹니다.(처음 헤어는 목록에 없다 가정)
- 참고. ${client.prefix}헤어 확률`,
    type: ["메이플"],
    async execute(message, args) {
        if (args.length == 1 && (args[0] == '확률' || args[0] == 'ㅎㄹ')) {
            let rslt = '<로얄 헤어 확률>\n\n- 남자 헤어';
            for (let key in proper["남"]) {
                rslt += `\n${key}: ${proper["남"][key]}%`;
            }
            rslt += '\n\n- 여자 헤어';
            for (let key in proper["여"]) {
                rslt += `\n${key}: ${proper["여"][key]}%`;
            }
            return message.channel.send(rslt);
        }
        if (args.length < 2) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        const gender = args.shift()[0];
        const goalhair = Object.keys(proper[gender] ?? {}).find((v) => v.replace(/\s+/, '').includes(args.join('')));
        if (!goalhair) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        // gender은 성별, goalhair는 목표 헤어 이름
        // random은 0이상 1미만
        const list = []; // 진행 과정 담을 배열
        let rslt = `로얄 헤어 (목표: ${goalhair}) 결과\n\n`;
        let propsum = 0; // 확률표의 확률값의 합
        for (let key in proper[gender]) {
            propsum += proper[gender][key];
        }
        for (let nowhair = '', proptemp = 0; nowhair != goalhair;) {
            const now = Math.floor(Math.random() * (propsum - proptemp) + 1);
            let sum = 0;
            for (let key in proper[gender]) {
                sum += proper[gender][key];
                if (now <= sum) {
                    if (nowhair) {
                        proper[gender][nowhair] = proptemp; // 원래 확률값 복원
                    }
                    nowhair = key;
                    list.push(nowhair); // 현재 뜬 헤어 저장
                    if (nowhair != goalhair) {
                        proptemp = proper[gender][nowhair]; // 원래 값 저장
                        proper[gender][nowhair] = 0; // 현재 헤어의 확률을 0으로 수정 (중복방지)
                    }
                    break;
                }
            }
        }

        rslt += `수행 횟수: ${list.length}회\n\n진행 과정`;
        for (let i in list) {
            rslt += `\n${+i + 1}번째: ${list[i]}`;
        }
        return message.channel.send(rslt);
    }
};