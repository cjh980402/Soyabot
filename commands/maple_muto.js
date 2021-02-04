const picmatch = {
    "앗볶음": "AtFried",
    "헉튀김": "HeokFried",
    "허허말이": "HeoheoRoll",
    "이런면": "ThisNoodle",
    "저런찜": "ThatBraised",
    "호호탕": "HohoTang",
    "으악샐러드": "UakSalad",
    "크헉구이": "KheokGriled",
    "깔깔만두": "laughinMandoo",
    "낄낄볶음밥": "KilkilFried",
    "오잉피클": "OingPickle",
    "휴피자": "HyooPizza",
    "하빵": "HaBread",
    "큭큭죽": "KeukkeukSoup",
    "엉엉순대": "CryingSundae",
    "흑흑화채": "HeukheukHwachae"
};

module.exports = {
    usage: `${client.prefix}무토 (요리 이름)`,
    command: ["무토", "ㅁㅌ"],
    description: `- 해당하는 요리의 레시피를 출력합니다.
- (요리 이름) : ${Object.keys(picmatch).join(", ")} 입력가능`,
    type: ["메이플"],
    async execute(message, args) {
        if (picmatch[args[0]]) {
            return message.channel.send(`${args[0]} 요리의 레시피`, {
                files: [`./pictures/muto/${picmatch[args[0]]}.png`]
            });
        }
        else {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
    }
};