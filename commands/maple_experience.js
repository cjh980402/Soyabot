const { levelTable } = require('../util/soyabot_const.json');

module.exports = {
    usage: `${client.prefix}경험치 (시작 레벨) (끝 레벨)`,
    command: ['경험치', 'ㄱㅎㅊ'],
    description: `- 시작 레벨에서 끝 레벨을 달성할 때까지의 경험치통과 끝 레벨 기준 누적 경험치 비율을 계산합니다.
- 끝 레벨을 생략 시 시작 레벨의 경험치통과 누적 경험치 비율을 계산합니다.`,
    type: ['메이플'],
    async execute(message, args) {
        if (args.length !== 1 && args.length !== 2) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const startlev = Math.trunc(args[0]);
        if (args.length === 2) {
            const endlev = Math.trunc(args[1]);
            if (isNaN(startlev) || startlev < 1 || startlev > 299) {
                return message.channel.send('1 ~ 299 범위의 시작 레벨을 입력해주세요.');
            }
            if (isNaN(endlev) || endlev < startlev || endlev > 300) {
                return message.channel.send('시작 레벨 ~ 300 범위의 끝 레벨을 입력해주세요.');
            }

            const rslt = `Lv.${startlev} → Lv.${endlev} 경험치통: ${(levelTable[endlev - 1] - levelTable[startlev - 1]).toLocaleString()}
(${(levelTable[endlev - 1] - levelTable[startlev - 1]).toLocaleUnitString()})
진행률 (~250): ${(Math.min(levelTable[endlev - 1] / levelTable[249], 1) * 100).toFixed(3)}%
진행률 (~275): ${(Math.min(levelTable[endlev - 1] / levelTable[274], 1) * 100).toFixed(3)}%
진행률 (~300): ${((levelTable[endlev - 1] / levelTable[299]) * 100).toFixed(3)}%`;
            return message.channel.send(rslt);
        } else {
            if (isNaN(startlev) || startlev < 1 || startlev > 300) {
                return message.channel.send('1 ~ 300 범위의 시작 레벨을 입력해주세요.');
            }

            const rslt = `Lv.${startlev} 경험치통: ${(levelTable[startlev] - levelTable[startlev - 1]).toLocaleString()}
(${(levelTable[startlev] - levelTable[startlev - 1]).toLocaleUnitString()})
진행률 (~250): ${(Math.min(levelTable[startlev - 1] / levelTable[249], 1) * 100).toFixed(3)}%
진행률 (~275): ${(Math.min(levelTable[startlev - 1] / levelTable[274], 1) * 100).toFixed(3)}%
진행률 (~300): ${((levelTable[startlev - 1] / levelTable[299]) * 100).toFixed(3)}%`;
            return message.channel.send(rslt);
        }
    }
};
