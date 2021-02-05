const normalitem = require('../util/normal_starforce');

module.exports = {
    usage: `${client.prefix}스타포스시뮬 A B C D E F`,
    command: ["스타포스시뮬", "ㅅㅌㅍㅅㅅㅁ"],
    description: `- A: 아이템 레벨 제한 (98 ~ 200)
- B: 시작 스타포스 개수
- C: 목표 스타포스 개수
- D: 스타캐치 미적용 = 0 / 스타캐치 적용 = 1
- E: 30퍼 할인 이벤트 = 1
     5, 10, 15성 100% 성공 이벤트 = 2
     이벤트 미적용 = 3
- F: 파괴 방지 (12 ~ 17성 적용) = 1
     파괴 방지 (15 ~ 17성 적용) = 2
     파괴 방지 미적용 = 3`,
    type: ["메이플"],
    async execute(message, args) {
        if (!args[0]) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        const result = new normalitem();
        return message.channel.send(result.doingStarforce(args.map(v => +v)));
    }
};