module.exports = {
    usage: `${client.prefix}방무 (몬스터의 방어율) (현재 방무) (추가 방무1) (추가 방무2)...`,
    command: ["방무", "ㅂㅁ"],
    description: `- 실방무와 딜량을 계산합니다.
예) 방어율 250% 몬스터에게 현재 방무 90%이고 추가되는 방무가 20이면 !방무 250 90 20`,
    type: ["메이플"],
    execute(message, args) {
        if (args.length < 2)
            return message.channel.send(`${this.usage}\n- 대체 명령어 : ${this.command}\n${this.description}`);

        args = args.map(v => +v);
        const monster = args[0];
        let sum = 1;

        for (let i = 1; i < args.length; i++) {
            if (args[i] < 0 || args[i] > 100 || isNaN(args[i])) {
                return message.channel.send('입력한 값이 잘못되었습니다.');
            }
            sum *= (1 - args[i] / 100); // sum은 실제로 무시하고 남은 양
        }

        let boss_damage = ((1 - (monster / 100 * sum)) * 100).toFixed(2);
        if (boss_damage < 0) {
            boss_damage = 0;
        }
        message.channel.send(`총 합 방무 : ${((1 - sum) * 100).toFixed(2)}%\n방어율 ${monster}%인 대상에게 딜량 : ${boss_damage}%`);
    }
};