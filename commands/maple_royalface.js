const faceList = {
    남: ['정결한 얼굴', '올림 얼굴', '꿈꾸는 얼굴', '뽀잉 얼굴', '딜런 성형', '아잉 얼굴'],
    여: ['메이벨 얼굴', '맑음 얼굴', '꿈꾸는 얼굴', '뽀잉 얼굴', '로잘리아 성형', '아잉 얼굴']
}; // 성형은 모두 동일 확률이므로 배열을 이용

module.exports = {
    usage: `${client.prefix}성형 (성별) (목표 성형 이름)`,
    command: ['성형', 'ㅅㅎ'],
    description: `- 해당 성별의 목표 성형을 얻을 때까지 로얄 성형 시뮬을 수행합니다.
- 적용 중인 성형이 목록에 존재할 경우 나머지 성형만 뜹니다.(처음 성형은 목록에 없다 가정)
- 참고. ${client.prefix}성형 확률`,
    type: ['메이플'],
    async execute(message, args) {
        if (args.length == 1 && (args[0] == '확률' || args[0] == 'ㅎㄹ')) {
            const rslt = `<로얄 성형 확률>\n\n- 남자 성형\n${faceList['남'].map((v) => `${v}: 17%`).join('\n')}\n\n- 여자 성형\n${faceList['여'].map((v) => `${v}: 17%`).join('\n')}`;
            return message.channel.send(rslt);
        }
        if (args.length < 2) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        const gender = args.shift()[0];
        const goalface = (faceList[gender] ?? []).findIndex((v) => v.replace(/\s+/, '').includes(args.join('')));
        if (goalface == -1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        // gender은 성별, goalface는 목표 성형의 인덱스
        // random은 0이상 1미만
        const list = []; // 진행 과정 담을 배열 (인덱스 저장)

        while (list[list.length - 1] != goalface) {
            // 목표 성형을 띄웠으면 종료
            const now = Math.floor(Math.random() * (faceList[gender].length - +(list.length > 0)));
            list.push(now + +(list[list.length - 1] <= now)); // 현재 뜬 성형의 인덱스 저장, now 뒤에 더하는 이유는 최근 성형 제외 목적
        }

        const rslt = `로얄 성형 (목표: ${faceList[gender][goalface]}) 결과\n\n수행 횟수: ${list.length}회\n\n진행 과정\n${list.map((v, i) => `${i + 1}번째: ${faceList[gender][v]}`).join('\n')}`;
        return message.channel.send(rslt);
    }
};
