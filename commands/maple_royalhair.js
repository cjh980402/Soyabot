const probTable = {
    "남": {
        "산호 헤어": 10,
        "크림라떼 헤어": 15,
        "스윗송 헤어": 15,
        "순수 헤어": 20,
        "아이돌스타": 20,
        "소솜 헤어": 20
    },
    "여": {
        "뮬리 헤어": 10,
        "블링 소프라노 헤어": 15,
        "솜솜이 헤어": 15,
        "아이비 헤어": 20,
        "보브 세란 헤어": 20,
        "다솜 헤어": 20
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
            for (let key in probTable["남"]) {
                rslt += `\n${key}: ${probTable["남"][key]}%`;
            }
            rslt += '\n\n- 여자 헤어';
            for (let key in probTable["여"]) {
                rslt += `\n${key}: ${probTable["여"][key]}%`;
            }
            return message.channel.send(rslt);
        }
        if (args.length < 2) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        const gender = args.shift()[0];
        const goalhair = Object.keys(probTable[gender] ?? {}).find((v) => v.replace(/\s+/, '').includes(args.join('')));
        if (!goalhair) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        // gender은 성별, goalhair는 목표 헤어 이름
        // random은 0이상 1미만
        const list = []; // 진행 과정 담을 배열
        let rslt = `로얄 헤어 (목표: ${goalhair}) 결과\n\n`;
        const probSum = Object.values(probTable[gender]).reduce((acc, cur) => acc + cur); // 확률표의 확률값의 합

        for (let nowhair = '', proptemp = 0; nowhair != goalhair;) {
            const now = Math.floor(Math.random() * (probSum - proptemp) + 1);
            let sum = 0;
            for (let key in probTable[gender]) {
                sum += probTable[gender][key];
                if (now <= sum) {
                    if (nowhair) {
                        probTable[gender][nowhair] = proptemp; // 원래 확률값 복원
                    }
                    nowhair = key;
                    list.push(nowhair); // 현재 뜬 헤어 저장
                    if (nowhair != goalhair) {
                        proptemp = probTable[gender][nowhair]; // 원래 값 저장
                        probTable[gender][nowhair] = 0; // 현재 헤어의 확률을 0으로 수정 (중복방지)
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