export const usage = `${client.prefix}방무 (몬스터의 방어율) (현재 방무) (추가 방무1) (추가 방무2) ...`;
export const command = ['방무', 'ㅂㅁ'];
export const description = `- 실방무와 딜량을 계산합니다. 추가 방무가 음수면 해당 수치를 원래 방무에서 제거합니다.
예) 방어율 250% 몬스터에게 현재 방무 90%, 추가 방무 20%, 제거할 방무 10% → ${client.prefix}방무 250 90 20 -10`;
export const type = ['메이플'];
export async function messageExecute(message, args) {
    if (args.length < 2) {
        return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
    }

    const igList = args.map((v) => +v);
    const monster = igList.shift();
    if (isNaN(monster) || monster < 0) {
        return message.channel.send('입력한 값이 잘못되었습니다.');
    }

    let sum = 1;
    for (const ig of igList) {
        sum = ig >= 0 ? sum * (1 - ig / 100) : sum / (1 + ig / 100); // sum은 실제로 무시하고 남은 양의 비율
        if (sum > 1 || ig < -100 || ig > 100 || isNaN(ig)) {
            return message.channel.send('입력한 값이 잘못되었습니다.');
        }
    }

    const boss_damage = Math.max(100 - monster * sum, 0);
    return message.channel.send(`총 합 방무: ${((1 - sum) * 100).toFixed(2)}%\n방어율 ${monster}%인 대상에게 딜량: ${boss_damage.toFixed(2)}%`);
}
export const commandData = {
    name: '방무',
    description: '실방무와 딜량을 계산합니다. 추가 방무가 음수면 해당 수치를 원래 방무에서 제거합니다.',
    options: [
        {
            name: '몬스터의_방어율',
            type: 'NUMBER',
            description: '공격 대상 몬스터의 방어율',
            required: true
        },
        {
            name: '현재_방무',
            type: 'NUMBER',
            description: '캐릭터의 현재 방무 수치',
            required: true
        },
        {
            name: '추가_방무1',
            type: 'NUMBER',
            description: '추가할 방무 수치'
        },
        {
            name: '추가_방무2',
            type: 'NUMBER',
            description: '추가할 방무 수치'
        }
    ]
};
export async function commandExecute(interaction) {
    const monster = interaction.options.getNumber('몬스터의_방어율');
    const igList = [interaction.options.getNumber('현재_방무'), interaction.options.getNumber('추가_방무1') ?? 0, interaction.options.getNumber('추가_방무2') ?? 0];
    if (monster < 0) {
        return interaction.followUp('입력한 값이 잘못되었습니다.');
    }

    let sum = 1;
    for (const ig of igList) {
        sum = ig >= 0 ? sum * (1 - ig / 100) : sum / (1 + ig / 100); // sum은 실제로 무시하고 남은 양의 비율
        if (sum > 1 || ig < -100 || ig > 100) {
            return interaction.followUp('입력한 값이 잘못되었습니다.');
        }
    }

    const boss_damage = Math.max(100 - monster * sum, 0);
    return interaction.followUp(`총 합 방무: ${((1 - sum) * 100).toFixed(2)}%\n방어율 ${monster}%인 대상에게 딜량: ${boss_damage.toFixed(2)}%`);
}
