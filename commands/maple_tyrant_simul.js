const superialitem = require('../util/superial_starforce');

module.exports = {
    usage: `${client.prefix}타일런트시뮬 A B C`,
    command: ["타일런트시뮬", "ㅌㅇㄹㅌㅅㅁ", "ㅌㅇㄾㅅㅁ"],
    description: `- A: 시작 스타포스 개수
- B: 목표 스타포스 개수
- C: 스타캐치 미적용 = 0 / 스타캐치 적용 = 1`,
    type: ["메이플"],
    async execute(message, args) {
        if (!args[0]) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        const result = new superialitem();
        return message.channel.send(result.doingStarforce(args.map(v => +v)));
    }
};