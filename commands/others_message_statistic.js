module.exports = {
    usage: `${client.prefix}채팅량 @대상유저멘션`,
    command: ["채팅량", "ㅊㅌㄹ"],
    description: "- 해당하는 유저의 채팅 통계를 보여줍니다. 대상유저를 생략시에는 본인의 채팅 통계를 보여줍니다.",
    channelCool: true,
    type: ["기타"],
    async execute(message, args) {
        if (!message.guild) {
            return message.channel.send("사용이 불가능한 채널입니다.");
        }
        const findId = /<@!?(\d+)>/.exec(args[0]);
        const targetId = findId ? findId[1] : message.author.id;

        const messagestat = await db.get(`SELECT * FROM messagedb WHERE channelsenderid = ?`, [`${message.guild.id} ${targetId}`]);
        if (messagestat) {
            return message.channel.send(`<@${targetId}>
채팅 건수: ${messagestat.messagecnt}
문자 개수: ${messagestat.lettercnt}
채팅 지수: ${(messagestat.lettercnt / messagestat.messagecnt).toFixed(2)}`);
        }
        else {
            return message.channel.send(`<@${targetId}>\n채팅 건수: 0\n문자 개수: 0\n채팅 지수: 0.00`);
        }
    }
};