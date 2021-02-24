const { MessageEmbed, MessageAttachment } = require("discord.js");
const mapleModule = require("../util/maple_parsing");
const scoreGrade = [
    [0, "메린이"],
    [300, "무자본 평균"],
    [350, "메른이"],
    [400, "메벤 평균"],
    [450, "경손실 따질 스펙"],
    [500, "메덕"],
    [550, "현생보다도 메이플"],
    [600, "메생살이"],
    [650, "초월자"],
    [Infinity, ""]
];

module.exports = {
    usage: `${client.prefix}스카우터 (닉네임)`,
    command: ["스카우터", "ㅅㅋㅇㅌ"],
    description: "- 정해진 조건으로 해당 캐릭터의 점수를 평가합니다. 닉네임을 생략시에는 기준 점수표를 보여줍니다.",
    type: ["메이플"],
    async execute(message, args) {
        if (args.length != 1) {
            let rslt = "스카우터 기준 점수표";
            for (let i = 0; i < scoreGrade.length - 2; i++) {
                rslt += `\n${scoreGrade[i][0]} ~ ${scoreGrade[i + 1][0] - 1}점: ${scoreGrade[i][1]}`;
            }
            rslt += `\n${scoreGrade[scoreGrade.length - 2][0]}점 이상: ${scoreGrade[scoreGrade.length - 2][1]}`;
            return message.channel.send(rslt);
        }

        const Maple = new mapleModule(args[0]);
        const union = (await Maple.homeUnion())?.[0];
        if (!union) {
            return message.channel.send(`[${Maple.Name}]\n존재하지 않거나 월드 내 최고 레벨이 아닌 캐릭터입니다.`);
        }

        if (!(await Maple.isLatest())) {
            message.channel.send('최신 정보가 아니어서 갱신 작업을 먼저 수행하는 중입니다.');
            if (!(await Maple.updateGG())) {
                message.channel.send('제한시간 내에 갱신 작업을 실패하였습니다.');
            }
        }

        const level = Maple.Level();
        const job = Maple.Job();

        let murungfl, time, min, sec;

        const murung = Maple.Murung();
        if (!murung) {
            murungfl = 0;
            min = 0;
            sec = 0;
            time = 900;
        }
        else {
            murungfl = +/\d+/.exec(murung[1]);
            [min, sec] = murung[2].match(/\d+/g).map((v) => +v);
            time = min * 60 + sec;
        }

        const score = Math.floor(level - ((level >= 275) ? 50 : 100) + (murungfl + 1 - time / 900) * ((murungfl >= 45) ? 4 : 3) + (union / ((union >= 8000) ? 32 : 40)));
        let grade;
        for (let i = 0; i < scoreGrade.length - 1; i++) {
            if (scoreGrade[i][0] <= score && score < scoreGrade[i + 1][0]) {
                grade = scoreGrade[i][1];
                break;
            }
        }

        const attachment = new MessageAttachment(Maple.userImg(), 'scouter.png');
        const scouterEmbed = new MessageEmbed()
            .setTitle(`**${Maple.Name}님의 측정결과**`)
            .setColor("#FF9899")
            .attachFiles(attachment)
            .setURL(Maple.GGURL)
            .setImage('attachment://scouter.png')
            .addField('**직업**', job, true)
            .addField('**유니온**', union.toLocaleString(), true)
            .addField('**레벨**', level, true)
            .addField('**무릉 기록**', `${murungfl}층`, true)
            .addField('**기록 시간**', `${min}분 ${sec}초`, true)
            .addField('**측정 결과**', `${grade}! (${score}점)`);

        return message.channel.send(scouterEmbed);
    }
};