module.exports = {
    usage: `${client.prefix}수로휴가`,
    command: ["수로휴가", "ㅅㄹㅎㄱ", "ㅅㅀㄱ"],
    description: "- 길드 지하수로 휴가 신청서",
    type: ["메이플"],
    execute(message) {
        message.channel.send('수로 휴가 신청서', {
            files: ['./pictures/guild_vacation.png']
        });
    }
};
