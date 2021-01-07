module.exports.canModifyQueue = function (member) {
    const { channelID } = member.voice;
    const botChannelID = member.guild.voice.channelID;

    return (!botChannelID || channelID == botChannelID); // 봇이 참가한 음성채널과 다른 경우 false 반환
}