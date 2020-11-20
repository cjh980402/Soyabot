function guildNickname(guild, user) {
    return guild.members.cache.find(v => v.user == user).nickname || user.username;
}

module.exports = {
    usage: `${client.prefix}채팅량`,
    command: ["채팅량", "ㅊㅌㄹ"],
    description: "- 본인의 채팅 통계를 보여줍니다.",
    channelCool: true,
    type: ["기타"],
    async execute(message) {
        const messagestat = await db.get(`SELECT * FROM messagedb WHERE channelsenderid = ?`, [`${message.guild.id} ${message.author.id}`]);
        if (messagestat) {
            return message.channel.send(`${guildNickname(message.guild, message.author)}
채팅 건수: ${messagestat.messagecnt}
문자 개수: ${messagestat.lettercnt}
채팅 지수: ${(messagestat.lettercnt / messagestat.messagecnt).toFixed(2)}`);
        }
        else {
            return message.channel.send(`${guildNickname(message.guild, message.author)}\n채팅 건수: 0\n문자 개수: 0\n채팅 지수: 0.00`);
        }
    }
};