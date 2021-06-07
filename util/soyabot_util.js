module.exports.canModifyQueue = function (member) {
    const { channelID } = member.voice;
    const botChannelID = member.guild.me.voice.channelID;

    return !botChannelID || channelID === botChannelID; // 봇이 참가한 음성채널과 다른 경우 false 반환
};

module.exports.getMessageImage = async function (message) {
    if (message.reference) {
        message = await message.channel.messages.fetch(message.reference.messageID);
    }

    return message?.attachments.first()?.height ? message.attachments.first().url : null;
};
