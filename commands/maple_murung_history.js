const mapleModule = require("../util/maple_parsing");

module.exports = {
    usage: `${client.prefix}무릉히스토리 (닉네임)`,
    command: ["무릉히스토리", "ㅁㄹㅎㅅㅌㄹ", "ㅁㅀㅅㅌㄹ"],
    description: '- 캐릭터의 무릉도장 클리어 내역을 보여줍니다.',
    type: ["메이플"],
    async execute(message, args) {
        if (args.length != 1) {
            return message.channel.send(`${this.usage}\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const Maple = new mapleModule(args[0]);
        if (!(await Maple.isExist()) || !Maple.homeLevel()) {
            return message.channel.send(`[${Maple.Name}]\n존재하지 않는 캐릭터입니다.`);
        }
        if (!(await Maple.isLatest())) {
            message.channel.send('최신 정보가 아니어서 갱신 작업을 먼저 수행하는 중입니다.');
            if (!(await Maple.updateGG())) {
                message.channel.send('제한시간 내에 갱신 작업을 실패하였습니다.');
            }
        }
        const data = Maple.MurungHistory();
        if (data == null) {
            return message.channel.send(`[${Maple.Name}]\n기록이 없습니다.`);
        }
        else {
            let rslt = `[${Maple.Name}]`;
            for (let i = data[0].length - 1; i >= 0; i--) {
                rslt += `\n${data[0][i]}: ${data[1][i]}`;
            }
            return message.channel.send(rslt);
        }
    }
};