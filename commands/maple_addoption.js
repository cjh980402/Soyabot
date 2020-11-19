const picmatch = {
    "포이즈닉": "poisonic",
    "자쿰": "poisonic",
    "네크로": "necro",
    "반레온": "von_leon",
    "쟈이힌": "jaihind",
    "여제": "cygnus",
    "우트가르드": "utgard",
    "파프니르": "fafnir",
    "파프": "fafnir",
    "앱솔랩스": "absolute_labs",
    "앱솔": "absolute_labs",
    "아케인셰이드": "arcaneshade",
    "아케인": "arcaneshade",
    "제네시스": "genesis",
    "제네": "genesis",
    "제로": "zero"
};

module.exports = {
    usage: `${client.prefix}추옵 (무기)`,
    command: ["추옵", "ㅊㅇ"],
    description: `- 해당하는 무기의 추옵표를 출력합니다.
- (무기) : 포이즈닉(자쿰), 네크로, 반레온, 쟈이힌, 여제, 우트가르드, 파프, 앱솔, 아케인, 제네시스, 제로, 해카세 입력가능`,
    type: ["메이플"],
    async execute(message, args) {
        if (picmatch[args[0]]) {
            return message.channel.send(`${args[0]} 무기의 추옵표`, {
                files: [`./pictures/add_option/${picmatch[args[0]]}.png`]
            });
        }
        else if (args[0] == '해카세') {
            return message.channel.send('해방된 카이세리움\n기본 공격력: 400\n추가옵션: 16 / 36 / 59 / 86 / 118');
        }
        else {
            return message.channel.send(`**${cmd.usage}**\n- 대체 명령어: ${cmd.command.join(', ')}\n- ${cmd.description}`);
        }
    }
};
