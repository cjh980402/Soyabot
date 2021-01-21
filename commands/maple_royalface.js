const proper = {
    "남": {
        "차차 얼굴": 17,
        "차분한 헤헤 얼굴": 17,
        "은구슬 얼굴": 17,
        "안개비 얼굴": 17,
        "미래적인 얼굴": 17,
        "코분홍 얼굴": 17
    },
    "여": {
        "차차 얼굴": 17,
        "샤이닝 얼굴": 17,
        "은구슬 얼굴": 17,
        "안개비 얼굴": 17,
        "미래적인 얼굴": 17,
        "코분홍 얼굴": 17
    }
}

module.exports = {
    usage: `${client.prefix}성형 (성별) (목표 성형 이름)`,
    command: ["성형", "ㅅㅎ"],
    description: `- 해당 성별의 목표 성형을 얻을 때까지 로얄 성형 시뮬을 수행합니다.
- 적용 중인 성형이 목록에 존재할 경우 나머지 성형만 뜹니다.(처음 성형은 목록에 없다 가정)
- 참고. ${client.prefix}성형 확률`,
    type: ["메이플"],
    async execute(message, args) {
        if (args.length == 1 && (args[0] == '확률' || args[0] == 'ㅎㄹ')) {
            let rslt = '<로얄 성형 확률>\n\n- 남자 성형';
            for (let key in proper["남"]) {
                rslt += `\n${key}: ${proper["남"][key]}%`;
            }
            rslt += '\n\n- 여자 성형';
            for (let key in proper["여"]) {
                rslt += `\n${key}: ${proper["여"][key]}%`;
            }
            return message.channel.send(rslt);
        }
        if (args.length < 2) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        const gender = args.shift()[0];
        const goalface = args.join(' ');
        if (!proper[gender] || !proper[gender][goalface]) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        // gender은 성별, goalface는 목표 성형 이름
        // random은 0이상 1미만
        const list = []; // 진행 과정 담을 배열
        let rslt = `로얄 성형 (목표: ${goalface}) 결과\n\n`;
        let propsum = 0; // 확률표의 확률값의 합
        for (let key in proper[gender]) {
            propsum += proper[gender][key];
        }
        for (let nowface = '', proptemp = 0; nowface != goalface;) {
            const now = Math.floor(Math.random() * (propsum - proptemp) + 1);
            let sum = 0;
            for (let key in proper[gender]) {
                sum += proper[gender][key];
                if (now <= sum) {
                    if (nowface) {
                        proper[gender][nowface] = proptemp; // 원래 확률값 복원
                    }
                    nowface = key;
                    list.push(nowface); // 현재 뜬 성형 저장
                    if (nowface != goalface) {
                        proptemp = proper[gender][nowface]; // 원래 값 저장
                        proper[gender][nowface] = 0; // 현재 성형의 확률을 0으로 수정 (중복방지)
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