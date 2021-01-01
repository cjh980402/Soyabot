const mapleModule = require("../util/maple_parsing");
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
    usage: `${client.prefix}레벨 (닉네임)`,
    command: ["레벨", "ㄹㅂ", "ㄼ"],
    description: `- 캐릭터의 공식 홈페이지의 레벨과 경험치를 기준으로 250, 275, 300까지 남은 경험치량을 계산합니다.
- 이미 달성한 레벨에 대한 계산은 수행하지 않습니다.`,
    type: ["메이플"],
    async execute(message, args) {
        if (args.length != 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        const Maple = new mapleModule(args[0]);
        const rslt = (await Maple.isExist()) ? Maple.homeLevel() : null;
        if (rslt == null) {
            return message.channel.send(`[${Maple.Name}]\n존재하지 않는 캐릭터입니다.`);
        }

        const char_lv = rslt[0];
        const char_ex = rslt[1];

        let repl = `[${Maple.Name}]\n직업: ${rslt[4]}\n현재: Lv.${char_lv}`;
        if (char_lv < 300) {
            const sumExp = levelTable[char_lv - 1] + char_ex;
            const percentage = (char_ex / (levelTable[char_lv] - levelTable[char_lv - 1]) * 100).toFixed(3);
            repl += ` (${percentage}%)`;

            const req_300 = numKoreanUnit(levelTable[299] - sumExp).slice(0, 2).join(" ");
            if (char_lv < 275) {
                const req_275 = numKoreanUnit(levelTable[274] - sumExp).slice(0, 2).join(" ");
                if (char_lv < 250) {
                    const req_250 = numKoreanUnit(levelTable[249] - sumExp).slice(0, 2).join(" ");
                    repl += `\n잔여량 (~250): ${req_250}\n진행률 (~250): ${(sumExp / levelTable[249] * 100).toFixed(3)}%`;
                }
                repl += `\n잔여량 (~275): ${req_275}\n진행률 (~275): ${(sumExp / levelTable[274] * 100).toFixed(3)}%`;
            }
            repl += `\n잔여량 (~300): ${req_300}\n진행률 (~300): ${(sumExp / levelTable[299] * 100).toFixed(3)}%`;
        }
        return message.channel.send(repl);
    }
};
