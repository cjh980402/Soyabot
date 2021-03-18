const faceList = {
    "남": ["쪼꼬미 얼굴", "신비로운 얼굴", "루시드 얼굴", "메이크업 킹 얼굴", "슬우 얼굴", "빠밤 얼굴"],
    "여": ["쪼꼬미 얼굴", "이국적인 얼굴", "루시드 얼굴", "메이크업 퀸 얼굴", "슬아 얼굴", "빠밤 얼굴"]
} // 성형은 모두 동일 확률이므로 배열을 이용

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
            faceList["남"].forEach((v) => rslt += `\n${v}: 17%`);
            rslt += '\n\n- 여자 성형';
            faceList["여"].forEach((v) => rslt += `\n${v}: 17%`);
            return message.channel.send(rslt);
        }
        if (args.length < 2) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        const gender = args.shift()[0];
        const goalface = (faceList[gender] ?? []).findIndex((v) => v.replace(/\s+/, '').includes(args.join('')));
        if (goalface == -1) {
            return message.channel.send(`${this.usage}\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        // gender은 성별, goalface는 목표 성형의 인덱스
        // random은 0이상 1미만
        const list = []; // 진행 과정 담을 배열 (인덱스 저장)
        let rslt = `로얄 성형 (목표: ${faceList[gender][goalface]}) 결과\n\n`;

        while (list[list.length - 1] != goalface) { // 목표 성형을 띄웠으면 종료
            const now = Math.floor(Math.random() * (faceList[gender].length - +(list.length > 0)));
            list.push(now + +(list[list.length - 1] <= now)); // 현재 뜬 성형의 인덱스 저장, now 뒤에 더하는 이유는 최근 성형 제외 목적
        }

        rslt += `수행 횟수: ${list.length}회\n\n진행 과정`;
        list.forEach((v, i) => rslt += `\n${i + 1}번째: ${faceList[gender][v]}`);
        return message.channel.send(rslt);
    }
};