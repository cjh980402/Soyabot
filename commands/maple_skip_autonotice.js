const noticematch = {
    공지: 'notice',
    업데이트: 'update',
    우르스: 'urus',
    테섭공지: 'test',
    테섭파일: 'testpatch'
};

module.exports = {
    usage: `${client.prefix}자동알림 (카테고리)`,
    command: ['자동알림', 'ㅈㄷㅇㄹ'],
    description: `- 입력한 카테고리(${Object.keys(noticematch).join(', ')})에 따른 자동알림 기능 상태를 전환합니다.
카테고리 생략 시 현재 알림상태를 알려줍니다.`,
    type: ['메이플'],
    async messageExecute(message, args) {
        if (!message.guildId) {
            return message.reply('사용이 불가능한 채널입니다.'); // 길드 여부 체크
        }
        if (!noticematch[args[0]]) {
            const notice = [];
            for (const key in noticematch) {
                if (await db.get(`SELECT * FROM ${noticematch[key]}skip WHERE channelid = ?`, [message.guildId])) {
                    // 현재 꺼짐
                    notice.push(`${key} 자동알림: OFF`);
                } else {
                    notice.push(`${key} 자동알림: ON`);
                }
            }
            return message.channel.send(notice.join('\n'));
        }
        const find = await db.get(`SELECT * FROM ${noticematch[args[0]]}skip WHERE channelid = ?`, [message.guildId]);
        if (find) {
            // 기존상태: OFF
            await db.run(`DELETE FROM ${noticematch[args[0]]}skip WHERE channelid = ?`, [message.guildId]);
            return message.channel.send(`${args[0]} 자동알림: **OFF → ON**`);
        } else {
            // 기존상태: ON
            await db.insert(`${noticematch[args[0]]}skip`, { channelid: message.guildId, name: message.guild.name });
            return message.channel.send(`${args[0]} 자동알림: **ON → OFF**`);
        }
    },
    commandData: {
        name: '자동알림',
        description: `입력한 카테고리(${Object.keys(noticematch).join(', ')})에 따른 자동알림 기능 상태를 전환합니다. 카테고리 생략 시 현재 알림상태를 알려줍니다.`,
        options: [
            {
                name: '카테고리',
                type: 'STRING',
                description: '자동알림 상태를 변경할 카테고리',
                choices: Object.keys(noticematch).map((v) => ({ name: v, value: v }))
            }
        ]
    },
    async commandExecute(interaction) {
        if (!interaction.guildId) {
            return interaction.followUp('사용이 불가능한 채널입니다.'); // 길드 여부 체크
        }

        const category = interaction.options.getString('카테고리');
        if (!noticematch[category]) {
            const notice = [];
            for (const key in noticematch) {
                if (await db.get(`SELECT * FROM ${noticematch[key]}skip WHERE channelid = ?`, [interaction.guildId])) {
                    // 현재 꺼짐
                    notice.push(`${key} 자동알림: OFF`);
                } else {
                    notice.push(`${key} 자동알림: ON`);
                }
            }
            return interaction.followUp(notice.join('\n'));
        }
        const find = await db.get(`SELECT * FROM ${noticematch[category]}skip WHERE channelid = ?`, [interaction.guildId]);
        if (find) {
            // 기존상태: OFF
            await db.run(`DELETE FROM ${noticematch[category]}skip WHERE channelid = ?`, [interaction.guildId]);
            return interaction.followUp(`${category} 자동알림: **OFF → ON**`);
        } else {
            // 기존상태: ON
            await db.insert(`${noticematch[category]}skip`, { channelid: interaction.guildId, name: interaction.guild.name });
            return interaction.followUp(`${category} 자동알림: **ON → OFF**`);
        }
    }
};
