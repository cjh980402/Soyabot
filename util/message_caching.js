const { CommandInteraction, Message } = require('./discord.js-extend');

module.exports = async function (messageOrInteraction) {
    if (messageOrInteraction instanceof Message) {
        if (!messageOrInteraction.guild) {
            return;
        }
        const senderKey = `${messageOrInteraction.guild.id} ${messageOrInteraction.author.id}`;
        const messagestat = await db.get('SELECT * FROM messagedb WHERE channelsenderid = ?', [senderKey]);
        await db.replace('messagedb', {
            channelsenderid: senderKey,
            messagecnt: (messagestat?.messagecnt ?? 0) + 1,
            lettercnt: (messagestat?.lettercnt ?? 0) + messageOrInteraction.content.replace(/[\s\u2007\u200b\u202d\u3164]/g, '').length,
            lastmessage: messageOrInteraction.content
        });
    } else if (messageOrInteraction instanceof CommandInteraction) {
        if (!messageOrInteraction.guild) {
            return;
        }
        const senderKey = `${messageOrInteraction.guild.id} ${messageOrInteraction.user.id}`;
        const messagestat = await db.get('SELECT * FROM messagedb WHERE channelsenderid = ?', [senderKey]);
        const content = `/${messageOrInteraction.commandName}${messageOrInteraction.options._hoistedOptions.map((v) => ` ${v.value}`).join('')}`;
        await db.replace('messagedb', {
            channelsenderid: senderKey,
            messagecnt: (messagestat?.messagecnt ?? 0) + 1,
            lettercnt: (messagestat?.lettercnt ?? 0) + content.replace(/[\s\u2007\u200b\u202d\u3164]/g, '').length,
            lastmessage: content
        });
    }
};
