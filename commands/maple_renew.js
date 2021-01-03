const mapleModule = require("../util/maple_parsing");

module.exports = {
    usage: `${client.prefix}갱신 (닉네임)`,
    command: ["갱신", "ㄱㅅ", "ㄳ"],
    description: '- 캐릭터의 메이플 gg 정보를 갱신합니다.',
    type: ["메이플"],
    async execute(message, args) {
        if (args.length != 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const Maple = new mapleModule(args[0]);
        if (!(await Maple.isExist()) || !Maple.homeLevel()) {
            return message.channel.send(`[${Maple.Name}]\n존재하지 않는 캐릭터입니다.`);
        }
        if (!(await Maple.isLatest())) {
            message.channel.send('최신 정보가 아니어서 갱신 작업을 수행하는 중입니다.');
            if (!(await Maple.updateGG())) {
                return message.channel.send('제한시간 내에 갱신 작업을 실패하였습니다.');
            }
            else {
                return message.channel.send(`[${Maple.Name}]\n갱신이 완료되었습니다.\n\n${decodeURI(Maple.GGURL)}`);
            }
        }
        else {
            return message.channel.send(`[${Maple.Name}]\n이미 최신 상태입니다.\n\n${decodeURI(Maple.GGURL)}`);
        }
    }
};