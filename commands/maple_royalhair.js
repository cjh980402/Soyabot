const hairList = {
    남: ['시크릿 컬러 헤어', '애쉬 프리즘 헤어', '레드카펫 헤어', '루시드 헤어', '파이 헤어', '포유 헤어'],
    여: ['시크릿 컬러 헤어', '포니테일 별구름 헤어', '델핀 헤어', '루시드 헤어', '리린 헤어', '아리아 헤어']
}; // 헤어는 모두 동일 확률이므로 배열을 이용

module.exports = {
    usage: `${client.prefix}헤어 (성별) (목표 헤어 이름)`,
    command: ['헤어', 'ㅎㅇ'],
    description: `- 해당 성별의 목표 헤어를 얻을 때까지 로얄 헤어 시뮬을 수행합니다.
- 적용 중인 헤어가 목록에 존재할 경우 나머지 헤어만 뜹니다.(처음 헤어는 목록에 없다 가정)
- 참고. ${client.prefix}헤어 확률`,
    type: ['메이플'],
    async messageExecute(message, args) {
        if (args.length === 1 && (args[0] === '확률' || args[0] === 'ㅎㄹ')) {
            const rslt = `<로얄 헤어 확률>\n\n- 남자 헤어\n${hairList['남'].map((v) => `${v}: 16.67%`).join('\n')}\n\n- 여자 헤어\n${hairList['여'].map((v) => `${v}: 16.67%`).join('\n')}`;
            return message.channel.send(rslt);
        }
        if (args.length < 2) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        const gender = args.shift()[0];
        const goalhair = (hairList[gender] ?? []).findIndex((v) => v.replace(/\s+/, '').includes(args.join('')));
        if (goalhair === -1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        // gender은 성별, goalhair는 목표 헤어의 인덱스
        // random은 0이상 1미만
        const list = []; // 진행 과정 담을 배열 (인덱스 저장)

        while (list[list.length - 1] !== goalhair) {
            // 목표 헤어을 띄웠으면 종료
            const now = Math.floor(Math.random() * (hairList[gender].length - +(list.length > 0)));
            list.push(now + +(list[list.length - 1] <= now)); // 현재 뜬 헤어의 인덱스 저장, now 뒤에 더하는 이유는 최근 헤어 제외 목적
        }

        const rslt = `로얄 헤어 (목표: ${hairList[gender][goalhair]}) 결과\n\n수행 횟수: ${list.length}회\n\n진행 과정\n${list.map((v, i) => `${i + 1}번째: ${hairList[gender][v]}`).join('\n')}`;
        return message.channel.send(rslt);
    },
    commandData: {
        name: '헤어',
        description: `해당 성별의 목표 헤어를 얻을 때까지 로얄 헤어 시뮬을 수행합니다.(참고. ${client.prefix}헤어 확률)`,
        options: [
            {
                name: '성별',
                type: 'STRING',
                description: '헤어 시뮬레이션을 수행할 성별',
                required: true,
                choices: ['남', '여', '확률'].map((v) => ({ name: v, value: v }))
            },
            {
                name: '목표_헤어_이름',
                type: 'STRING',
                description: '시뮬레이션의 목표 헤어',
                choices: [...hairList['남'], ...hairList['여']].deduplication().map((v) => ({ name: v, value: v }))
            }
        ]
    },
    async commandExecute(interaction) {
        const args = interaction.options.data.map((v) => v.value);

        if (args[0] === '확률' || args[0] === 'ㅎㄹ') {
            const rslt = `<로얄 헤어 확률>\n\n- 남자 헤어\n${hairList['남'].map((v) => `${v}: 16.67%`).join('\n')}\n\n- 여자 헤어\n${hairList['여'].map((v) => `${v}: 16.67%`).join('\n')}`;
            return interaction.followUp(rslt);
        }
        const gender = args.shift();
        const goalhair = (hairList[gender] ?? []).findIndex((v) => v === args[0]);
        if (goalhair === -1) {
            return interaction.followUp(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        // gender은 성별, goalhair는 목표 헤어의 인덱스
        // random은 0이상 1미만
        const list = []; // 진행 과정 담을 배열 (인덱스 저장)

        while (list[list.length - 1] !== goalhair) {
            // 목표 헤어을 띄웠으면 종료
            const now = Math.floor(Math.random() * (hairList[gender].length - +(list.length > 0)));
            list.push(now + +(list[list.length - 1] <= now)); // 현재 뜬 헤어의 인덱스 저장, now 뒤에 더하는 이유는 최근 헤어 제외 목적
        }

        const rslt = `로얄 헤어 (목표: ${hairList[gender][goalhair]}) 결과\n\n수행 횟수: ${list.length}회\n\n진행 과정\n${list.map((v, i) => `${i + 1}번째: ${hairList[gender][v]}`).join('\n')}`;
        return interaction.followUp(rslt);
    }
};
