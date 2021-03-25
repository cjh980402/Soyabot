const { create, all } = require("mathjs");
const math = create(all);

math.import({
    import: function () { throw new Error('Function import is disabled') },
    createUnit: function () { throw new Error('Function createUnit is disabled') },
    evaluate: function () { throw new Error('Function evaluate is disabled') },
    parse: function () { throw new Error('Function parse is disabled') }
}, { override: true }); // 일부 기능 사용을 제한한다.

function inputExpression(str) {
    return str.replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, "pi")
        .replace(/°/g, "deg")
        .replace(/√/g, "sqrt")
        .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (all) => `^(${all.split("").map((v) => "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(v)).join("")})`);
}

module.exports = {
    usage: `${client.prefix}ev (계산식)`,
    command: ["ev", "계산기", "ㄱㅅㄱ", "ㄳㄱ"],
    description: "- 계산식에 해당하는 결과값을 보여줍니다.",
    type: ["기타"],
    async execute(message, args) {
        if (args.length < 1) {
            return message.channel.send(`${this.usage}\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        try {
            return message.channel.send(String(math.evaluate(inputExpression(args.join(" ")))));
        }
        catch (e) {
            return message.channel.send("올바르지 않은 수식입니다.");
        }
    }
};