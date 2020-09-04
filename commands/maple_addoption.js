module.exports = {
    name: "추옵",
    aliases: ["ㅊㅇ"],
    description: "포이즈닉, 네크로, 반레온, 쟈이힌, 여제, 우트가르드, 파프, 앱솔, 아케인, 제네시스, 제로, 해카세의 추옵 출력",
    type: ["메이플"],
    execute(message, args) {
        if (!args[0])
            return message.channel.send(`**${message.client.prefix}${this.name} ${this.aliases ? `(${this.aliases})` : ""}**\n${this.description}`);
        if (args[0] == '포이즈닉' || args[0] == '자쿰') {
            message.channel.send(`${args[0]} 무기의 추옵표`, {
                files: ['./pictures/add_option/poisonic.png']
            });
        }
        else if (args[0] == '네크로') {
            message.channel.send(`${args[0]} 무기의 추옵표`, {
                files: ['./pictures/add_option/necro.png']
            });
        }
        else if (args[0] == '반레온') {
            message.channel.send(`${args[0]} 무기의 추옵표`, {
                files: ['./pictures/add_option/von_leon.png']
            });
        }
        else if (args[0] == '쟈이힌') {
            message.channel.send(`${args[0]} 무기의 추옵표`, {
                files: ['./pictures/add_option/jaihind.png']
            });
        }
        else if (args[0] == '여제') {
            message.channel.send(`${args[0]} 무기의 추옵표`, {
                files: ['./pictures/add_option/cygnus.png']
            });
        }
        else if (args[0] == '우트가르드') {
            message.channel.send(`${args[0]} 무기의 추옵표`, {
                files: ['./pictures/add_option/utgard.png']
            });
        }
        else if (args[0] == '파프니르' || args[0] == '파프') {
            message.channel.send(`${args[0]} 무기의 추옵표`, {
                files: ['./pictures/add_option/fafnir.png']
            });
        }
        else if (args[0] == '앱솔랩스' || args[0] == '앱솔') {
            message.channel.send(`${args[0]} 무기의 추옵표`, {
                files: ['./pictures/add_option/absolute_labs.png']
            });
        }
        else if (args[0] == '아케인셰이드' || args[0] == '아케인') {
            message.channel.send(`${args[0]} 무기의 추옵표`, {
                files: ['./pictures/add_option/arcaneshade.png']
            });
        }
        else if (args[0] == '제네시스' || args[0] == '제네') {
            message.channel.send(`${args[0]} 무기의 추옵표`, {
                files: ['./pictures/add_option/genesis.png']
            });
        }
        else if (args[0] == '제로') {
            message.channel.send(`${args[0]} 무기의 추옵표`, {
                files: ['./pictures/add_option/zero.png']
            });
        }
        else if (args[0] == '해카세') {
            message.channel.send('해방된 카이세리움\n기본 공격력 : 400\n추가옵션 : 16 / 36 / 59 / 86 / 118');
        }
    }
};
