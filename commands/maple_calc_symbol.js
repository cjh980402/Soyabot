module.exports = {
    usage: `${client.prefix}심볼 (시작 레벨) (목표 레벨)`,
    command: ["심볼", "ㅅㅂ"],
    description: `- 시작 레벨부터 목표 레벨까지의 심볼 요구갯수, 강화비용을 계산합니다.
- 현재심볼의 성장치는 고려하지 않습니다.
- 아케인 심볼은 1 ~ 20, 어센틱 심볼은 1 ~ 11 레벨입니다.
 예) ${client.prefix}심볼 5 20`,
    type: ["메이플"],
    async execute(message, args) {
        if (args.length != 2) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const startlev = +args[0], endlev = +args[1];
        if (isNaN(startlev) || startlev < 1 || startlev > 20) {
            return message.channel.send('1 ~ 20 범위의 시작 레벨을 입력해주세요.');
        }
        if (isNaN(endlev) || endlev < startlev || endlev > 20) {
            return message.channel.send('시작레벨 ~ 20 범위의 목표 레벨을 입력해주세요.');
        }

        let total_req1 = 0, total_req2 = 0, total_meso1 = 0, total_meso2 = 0, total_meso3 = 0;
        for (let i = startlev; i < endlev; i++) {
            total_req1 += i * i + 11; // 요구량 = i^2 + 11
            total_req2 += (i < 11 ? 9 * i * i + 20 * i : 0); // 요구량 = 9i^2 + 20i
            total_meso1 += 2370000 + 7130000 * i; // 여로 심볼
            total_meso2 += 12440000 + 6600000 * i; // 여로 제외 아케인
            total_meso3 += (i < 11 ? 96900000 + 88500000 * i : 0); // 어센틱 심볼
        }

        return message.channel.send(`아케인 심볼 ${startlev}레벨에서 ${endlev}레벨\n요구량: ${total_req1}\n여로: ${total_meso1.toLocaleString()}메소\n여로 제외: ${total_meso2.toLocaleString()}메소\n\n어센틱 심볼 ${Math.min(11, startlev)}레벨에서 ${Math.min(11, endlev)}레벨\n요구량: ${total_req2}\n세르니움: ${total_meso3.toLocaleString()}메소`);
    }
};