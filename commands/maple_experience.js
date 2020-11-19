const { levelTable } = require("../util/soyabot_const.json");

module.exports = {
    usage: `${client.prefix}경험치 (레벨)`,
    command: ["경험치", "ㄱㅎㅊ"],
    description: '- 입력한 레벨의 경험치통과 누적 경험치 비율을 계산합니다.',
    type: ["메이플"],
    async execute(message, args) {
        if (args.length != 1 || isNaN(args[0]) || +args[0] < 1 || +args[0] > 275) {
            return message.channel.send(`${this.usage}\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const lev = +args[0];
        const rslt = `Lv.${lev} 경험치통: ${lev < 275 ? (levelTable[lev] - levelTable[lev - 1]).toLocaleString() : 0}
진행률 (~250): ${((lev < 250 ? levelTable[lev - 1] / levelTable[249] : 1) * 100).toFixed(2)}%
진행률 (~275): ${(levelTable[lev - 1] / levelTable[274] * 100).toFixed(2)}%`;
        return message.channel.send(rslt);
    }
};