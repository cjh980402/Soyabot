module.exports = {
    usage: `${client.prefix}작분석 (총 공격력) (기본공) (레벨 제한) (강화 단계) (추가 옵션)`,
    command: ['작분석', 'ㅈㅂㅅ', 'ㅈㅄ'],
    description: `- 무기의 작으로 상승한 공격력을 계산합니다.
- 총 공격력: 무기의 총 공격력을 넣습니다. (기본공+파란색글씨+초록글씨)
- 기본공: 무기의 기본공마를 넣습니다.
- 레벨 제한: 130, 140, 150, 160, 200을 넣습니다.
- 강화 단계: 1 ~ 25성 사용가능 (130제는 20성까지)
- 추가 옵션: 무기의 추옵 공격력 수치 입력 (생략 가능)
(120레벨 이상 기준 주흔작 100%, 70%, 30%, 15%은 각각 공격력 3, 5, 7, 9 상승)`,
    type: ['메이플'],
    async execute(message, args) {
        if (args.length !== 4 && args.length !== 5) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        args = args.map((v) => +v);
        const starforce = {
            130: [6, 7, 7, 8, 9],
            140: [7, 8, 8, 9, 10, 11, 12, 30, 31, 32],
            150: [8, 9, 9, 10, 11, 12, 13, 31, 32, 33],
            160: [9, 9, 10, 11, 12, 13, 14, 32, 33, 34],
            200: [13, 13, 14, 14, 15, 16, 17, 34, 35, 36]
        };
        if (args[4]) {
            args[0] -= args[4]; // 추옵 수치를 빼준다.
        }
        if (!starforce[args[2]]) {
            return message.channel.send('130제, 140제, 150제, 160제, 200제 아이템만 가능합니다.');
        }
        if (args[2] === 130 && args[3] > 20) {
            return message.channel.send('130제는 20성까지만 가능합니다.');
        }
        if (args[3] < 0 || args[3] > 25) {
            return message.channel.send('강화 단계가 올바르지 않습니다.');
        }
        for (let i = args[3]; i >= 1; i--) {
            args[0] -= i >= 16 ? starforce[args[2]][i - 16] : Math.floor((args[0] + 50) / 51); // 스타포스 상승 수치를 없애는 과정
        }

        return message.channel.send(`${args[2]}제 ${args[3]}성 강화\n작으로 상승한 공: ${args[0] - args[1]}`);
    }
};
