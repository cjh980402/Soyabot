module.exports.canModifyQueue(member) {
    const { channelID } = member.voice;
    const botChannelID = member.guild.voice.channelID;

    if (botChannelID && channelID !== botChannelID) {
        return false;
    }
    return true;
}