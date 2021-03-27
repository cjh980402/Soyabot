const { Message } = require("./discord.js-extend");

module.exports = async function (message) {
    if (!(message instanceof Message && message.guild)) {
        return;
    }
    const messagestat = await db.get(`SELECT * FROM messagedb WHERE channelsenderid = ?`, [`${message.guild.id} ${message.author.id}`]);
    await db.replace('messagedb', {
        channelsenderid: `${message.guild.id} ${message.author.id}`,
        messagecnt: (messagestat?.messagecnt ?? 0) + 1,
        lettercnt: (messagestat?.lettercnt ?? 0) + message.content.replace(/[\s\u2007\u200b\u202d\u3164]/g, "").length,
        lastmessage: message.content
    });
}