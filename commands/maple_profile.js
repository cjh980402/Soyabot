const { exec } = require("../util/async_to_promis");
const mapleModule = require("../util/maple_parsing");

module.exports = {
    usage: `${client.prefix}프로필 (닉네임)`,
    command: ["프로필", "ㅍㄹㅍ", "ㅍㄿ"],
    description: "- 캐릭터의 메이플 gg 프로필을 출력합니다.",
    type: ["메이플"],
    async execute(message, args) {
        if (args.length != 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const Maple = new mapleModule(args[0]);
        const level = (await Maple.isExist()) ? Maple.homeLevel() : null;
        if (level == null) {
            return message.channel.send(`[${Maple.Name}]\n존재하지 않는 캐릭터입니다.`);
        }
        if (!(await Maple.isLatest())) {
            message.channel.send('최신 정보가 아니어서 갱신 작업을 먼저 수행하는 중입니다.');
            if (!(await Maple.updateGG())) {
                message.channel.send('제한시간 내에 갱신 작업을 실패하였습니다.');
            }
        }

        const rank = Maple.Rank();
        const rankString = rank[2] == "-위" ? " " : `월드 ${rank[2]} (전체 ${rank[3]})`;
        const murung = Maple.Murung();
        const union = Maple.Union();
        const seed = Maple.Seed();

        await exec(`python3 ./util/maple_gg_profile.py ${Maple.userImg(false)} ${Maple.Name} ${Maple.serverName()} ${level[0]} "${level[4]}" ${Maple.serverImg()} ${level[2].toLocaleString()} "${level[3] || "(없음)"}" "${rankString}" "${murung ? murung[1] : "기록없음"}" "${murung ? murung[2] : " "}" "${union ? union[3] : "기록없음"}" "${union ? `Lv.${union[0].toLocaleString()}` : " "}" "${seed ? seed[1] : "기록없음"}" "${seed ? seed[2] : " "}"`);
        return message.channel.send(`${Maple.Name}님의 프로필`, {
            files: ["./pictures/profile.png"]
        });
    }
};
