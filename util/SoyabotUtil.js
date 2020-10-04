module.exports = {
    canModifyQueue(member) {
        const { channel } = member.voice;
        const botChannel = member.guild.me.voice.channel;

        if (channel !== botChannel) {
            client.queue.get(member.guild.id).textChannel.send("음성 채널에 먼저 참가해주세요!").catch(console.error);
            return false;
        }

        return true;
    }
};
