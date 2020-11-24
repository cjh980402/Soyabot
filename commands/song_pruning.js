module.exports = {
    usage: `${client.prefix}pruning`,
    command: ["pruning"],
    description: "- 봇의 음악 메시지 자동정리 기능 상태를 전환합니다.",
    type: ["음악"],
    async execute(message) {
        const find = await db.get("SELECT * FROM pruningskip WHERE channelid = ?", [message.guild.id]);
        if (find) { // 기존상태: OFF
            await db.run("DELETE FROM pruningskip WHERE channelid = ?", [message.guild.id]);
            return message.channel.send("현재 메시지 자동정리: **OFF → ON**");
        }
        else { // 기존상태: ON
            await db.insert("pruningskip", { channelid: message.guild.id, name: message.guild.name });
            return message.channel.send("현재 메시지 자동정리: **ON → OFF**");
        }
    }
};
