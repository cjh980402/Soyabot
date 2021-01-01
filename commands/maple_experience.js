const { levelTable } = require("../util/soyabot_const.json");

function numKoreanUnit(num) { // 숫자 값에 한글 단위를 붙이는 함수
    const unit = ["경", "조", "억", "만", ""];
    const rslt = [];
    for (let i = 0, unitNum = 10000000000000000; i < unit.length; num %= unitNum, unitNum /= 10000, i++) {
        const tmp = Math.floor(num / unitNum);
        if (tmp > 0) {
            rslt.push(`${tmp}${unit[i]}`);
        }
    }
    return rslt;
}

module.exports = {
    usage: `${client.prefix}경험치 (레벨)`,
    command: ["경험치", "ㄱㅎㅊ"],
    description: '- 1 ~ 300 범위의 레벨을 입력하면 해당 레벨의 경험치통과 누적 경험치 비율을 계산합니다.',
    type: ["메이플"],
    async execute(message, args) {
        if (args.length != 1 || isNaN(args[0]) || +args[0] < 1 || +args[0] > 300) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const lev = +args[0];
        const rslt = `Lv.${lev} 경험치통: ${(levelTable[lev] - levelTable[lev - 1]).toLocaleString()}
(${numKoreanUnit(levelTable[lev] - levelTable[lev - 1]).join(" ") || 0})
진행률 (~250): ${(Math.min(levelTable[lev - 1] / levelTable[249], 1) * 100).toFixed(3)}%
진행률 (~275): ${(Math.min(levelTable[lev - 1] / levelTable[274], 1) * 100).toFixed(3)}%
진행률 (~300): ${(levelTable[lev - 1] / levelTable[299] * 100).toFixed(3)}%`;
        return message.channel.send(rslt);
    }
};