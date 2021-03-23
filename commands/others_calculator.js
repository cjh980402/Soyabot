const { evaluate } = require("mathjs");

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
            return message.channel.send(evaluate(inputExpression(args.join(" ").toLowerCase())));
        }
        catch (e) {
            return message.channel.send("올바르지 않은 수식입니다.");
        }
    }
};