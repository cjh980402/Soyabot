module.exports = {
    usage: `${client.prefix}방무 (몬스터의 방어율) (현재 방무) (추가 방무1) (추가 방무2) ...`,
    command: ['방무', 'ㅂㅁ'],
    description: `- 실방무와 딜량을 계산합니다. 추가 방무가 음수면 해당 수치를 원래 방무에서 제거합니다.
예) 방어율 250% 몬스터에게 현재 방무 90%, 추가 방무 20%, 제거할 방무 10% → ${client.prefix}방무 250 90 20 -10`,
    type: ['메이플'],
    async execute(message, args) {
        if (args.length < 2) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const igList = args.map((v) => +v);
        const monster = igList.shift();
        if (isNaN(monster) || monster < 0) {
            return message.channel.send('입력한 값이 잘못되었습니다.');
        }

        let sum = 1;
        for (let ig of igList) {
            sum = ig >= 0 ? sum * (1 - ig / 100) : sum / (1 + ig / 100); // sum은 실제로 무시하고 남은 양의 비율
            if (sum > 1 || ig < -100 || ig > 100 || isNaN(ig)) {
                return message.channel.send('입력한 값이 잘못되었습니다.');
            }
        }

        const boss_damage = Math.max(100 - monster * sum, 0);
        return message.channel.send(`총 합 방무: ${((1 - sum) * 100).toFixed(2)}%\n방어율 ${monster}%인 대상에게 딜량: ${boss_damage.toFixed(2)}%`);
    }
};
