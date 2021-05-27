const hairList = {
    남: ['코튼펌 헤어', '러블 헤어', '금비 헤어', '라온 헤어', '헤어스프레이 헤어', '노을 헤어'],
    여: ['치즈볼 헤어', '엘라 헤어', '은비 헤어', '원더 바니', '맑은 단발 헤어', '볼륨 부시시 헤어']
}; // 헤어는 모두 동일 확률이므로 배열을 이용

module.exports = {
    usage: `${client.prefix}헤어 (성별) (목표 헤어 이름)`,
    command: ['헤어', 'ㅎㅇ'],
    description: `- 해당 성별의 목표 헤어를 얻을 때까지 로얄 헤어 시뮬을 수행합니다.
- 적용 중인 헤어가 목록에 존재할 경우 나머지 헤어만 뜹니다.(처음 헤어는 목록에 없다 가정)
- 참고. ${client.prefix}헤어 확률`,
    type: ['메이플'],
    async execute(message, args) {
        if (args.length == 1 && (args[0] == '확률' || args[0] == 'ㅎㄹ')) {
            const rslt = `<로얄 헤어 확률>\n\n- 남자 헤어\n${hairList['남'].map((v) => `${v}: 16.67%`).join('\n')}\n\n- 여자 헤어\n${hairList['여'].map((v) => `${v}: 16.67%`).join('\n')}`;
            return message.channel.send(rslt);
        }
        if (args.length < 2) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        const gender = args.shift()[0];
        const goalhair = (hairList[gender] ?? []).findIndex((v) => v.replace(/\s+/, '').includes(args.join('')));
        if (goalhair == -1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        // gender은 성별, goalhair는 목표 헤어의 인덱스
        // random은 0이상 1미만
        const list = []; // 진행 과정 담을 배열 (인덱스 저장)

        while (list[list.length - 1] != goalhair) {
            // 목표 헤어을 띄웠으면 종료
            const now = Math.floor(Math.random() * (hairList[gender].length - +(list.length > 0)));
            list.push(now + +(list[list.length - 1] <= now)); // 현재 뜬 헤어의 인덱스 저장, now 뒤에 더하는 이유는 최근 헤어 제외 목적
        }

        const rslt = `로얄 헤어 (목표: ${hairList[gender][goalhair]}) 결과\n\n수행 횟수: ${list.length}회\n\n진행 과정\n${list.map((v, i) => `${i + 1}번째: ${hairList[gender][v]}`).join('\n')}`;
        return message.channel.send(rslt);
    }
};
