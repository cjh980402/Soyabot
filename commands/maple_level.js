const mapleModule = require("../util/maple_parsing");
const { levelTable } = require("../util/soyabot_const.json");

module.exports = {
    name: "레벨",
    aliases: ["ㄹㅂ", "ㄼ"],
    type: ["메이플"],
    description: "캐릭터의 공식 홈페이지 기준 레벨과 경험치를 통해 250, 275까지 남은 경험치량을 계산",
    async execute(message, args) {
        const Maple = new mapleModule(args[0]);
        const rslt = (await Maple.isExist()) ? Maple.homeLevel() : null;
        if (rslt == null) {
            return message.channel.send(`[${args[0]}]\n존재하지 않는 캐릭터입니다.`);
        }

        const char_lv = rslt[0];
        const char_ex = rslt[1].replace(/,/g, '');

        let repl = `[${args[0]}]\n현재 : Lv.${char_lv}`;
        if (char_lv < 275) {
            const percentage = (char_ex / (levelTable[char_lv] - levelTable[char_lv - 1]) * 100).toFixed(2);
            let req_275 = ((levelTable[274] - levelTable[char_lv - 1] - char_ex) / 1000000000000).toFixed(4);
            req_275 = `${(req_275 >= 1 ? req_275.replace('.', '조 ') : req_275.substr(2))}억`;

            repl += ` (${percentage}%)`;
            if (char_lv < 250) {
                let req_250 = ((levelTable[249] - levelTable[char_lv - 1] - char_ex) / 1000000000000).toFixed(4);
                req_250 = `${(req_250 >= 1 ? req_250.replace('.', '조 ') : req_250.substr(2))}억`;
                repl += `\n잔여량 (~250) : ${req_250}\n잔여량 (~275) : ${req_275}`;
            }
            else {
                repl += `\n잔여량 (~275) : ${req_275}`;
            }
        }
        message.channel.send(repl);
    }
};
