export function commandCount(db, commandName) {
    try {
        const data = db.get('SELECT * FROM commanddb WHERE commandname = ?', [commandName]);
        db.replace('commanddb', {
            commandname: commandName,
            count: (data?.count ?? 0) + 1
        });
    } catch (err) {
        console.error(err);
    }
}

export function canModifyQueue(member) {
    const botChannelId = member.guild.me.voice.channelId;
    if (!botChannelId) {
        throw new Error('봇이 음성채널에 참가하지 않은 상태입니다.');
    }
    return botChannelId === member.voice.channelId; // 봇이 참가한 음성채널과 다른 경우 false 반환
}

export function makePageMessage(target, embeds, options) {
    let currentPage = 0;
    const row = target.components[0];
    const collector = target.createMessageComponentCollector(options);

    collector
        .on('collect', async (itr) => {
            try {
                switch (itr.customId) {
                    case row.components[2].customId:
                        currentPage = (currentPage + 1) % embeds.length;
                        await target.edit({
                            content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
                            embeds: [embeds[currentPage]]
                        });
                        break;
                    case row.components[0].customId:
                        currentPage = (currentPage - 1 + embeds.length) % embeds.length;
                        await target.edit({
                            content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
                            embeds: [embeds[currentPage]]
                        });
                        break;
                    case row.components[1].customId:
                        collector.stop();
                        break;
                }
            } catch {}
        })
        .once('end', async () => {
            try {
                row.components.forEach((v) => v.setDisabled(true));
                await target.edit({
                    components: [row]
                });
            } catch {}
        });
}

export async function getMessageImage(message) {
    if (message.reference) {
        message = await message.fetchReference();
    }
    return message.attachments.first()?.height ? message.attachments.first().url : null;
}
