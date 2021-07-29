module.exports.canModifyQueue = function (member) {
    const botChannelId = member.guild.me.voice.channelId;
    return !botChannelId || botChannelId === member.voice.channelId; // 봇이 참가한 음성채널과 다른 경우 false 반환
};

module.exports.getMessageImage = async function (message) {
    if (message.reference) {
        message = await message.fetchReference();
    }
    return message?.attachments.first()?.height ? message.attachments.first().url : null;
};
