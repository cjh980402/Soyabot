const picmatch = {
    포이즈닉: 'poisonic',
    자쿰: 'poisonic',
    네크로: 'necro',
    반레온: 'von_leon',
    쟈이힌: 'jaihind',
    여제: 'cygnus',
    우트가르드: 'utgard',
    파프니르: 'fafnir',
    파프: 'fafnir',
    앱솔랩스: 'absolute_labs',
    앱솔: 'absolute_labs',
    아케인셰이드: 'arcaneshade',
    아케인: 'arcaneshade',
    제네시스: 'genesis',
    제네: 'genesis',
    제로: 'zero',
    해카세: 'others',
    기타: 'others'
};

module.exports = {
    usage: `${client.prefix}추옵 (무기)`,
    command: ['추옵', 'ㅊㅇ'],
    description: `- 해당하는 무기의 추옵표를 출력합니다.\n- (무기): ${Object.keys(picmatch).join(', ')} 입력가능`,
    type: ['메이플'],
    async execute(message, args) {
        if (picmatch[args[0]]) {
            return message.channel.send({ content: `${args[0]} 무기의 추옵표`, files: [`./pictures/add_option/${picmatch[args[0]]}.png`] });
        } else {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
    }
};
