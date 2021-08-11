const { MessageActionRow, MessageButton } = require('../util/discord.js-extend');
const { cmd } = require('../admin/admin_function');

module.exports = {
    usage: `${client.prefix}데굴데굴`,
    command: ['데굴데굴', 'ㄷㄱㄷㄱ'],
    description: '- 추억의 메이플스토리 주사위!',
    type: ['메이플'],
    async messageExecute(message) {
        const nickname = message.member?.nickname ?? message.author.username;
        await cmd(`python3 ./util/maple_stats_drawer.py '${nickname.replace(/'/g, '$&"$&"$&')}'`);
        // 파이썬 스크립트 실행, 쉘에서 작은 따옴표로 감싸서 쉘 특수문자 이스케이핑, 닉네임의 작은 따옴표는 별도로 이스케이핑
        const row = new MessageActionRow().addComponents(new MessageButton().setCustomId('repeat').setEmoji('🔁').setStyle('SECONDARY'));
        const dice = await message.channel.send({ content: `${nickname}님의 스탯`, files: ['./pictures/dice_result.png'], components: [row] });

        const filter = (itr) => itr.customId === 'repeat' && message.author.id === itr.user.id;
        const collector = dice.createMessageComponentCollector({ filter, time: 120000 });

        collector.once('collect', async () => {
            collector.stop();
            try {
                await dice.delete();
                await this.messageExecute(message);
            } catch {}
        });
    },
    commandData: {
        name: '데굴데굴',
        description: '추억의 메이플스토리 주사위!'
    },
    async commandExecute(interaction) {
        const nickname = interaction.member?.nickname ?? interaction.user.username;
        await cmd(`python3 ./util/maple_stats_drawer.py '${nickname.replace(/'/g, '$&"$&"$&')}'`);
        // 파이썬 스크립트 실행, 쉘에서 작은 따옴표로 감싸서 쉘 특수문자 이스케이핑, 닉네임의 작은 따옴표는 별도로 이스케이핑
        try {
            await interaction.deleteReply();
        } catch {}
        const row = new MessageActionRow().addComponents(new MessageButton().setCustomId('repeat').setEmoji('🔁').setStyle('SECONDARY'));
        const dice = await interaction.channel.send({ content: `${nickname}님의 스탯`, files: ['./pictures/dice_result.png'], components: [row] });

        const filter = (itr) => itr.customId === 'repeat' && interaction.user.id === itr.user.id;
        const collector = dice.createMessageComponentCollector({ filter, time: 120000 });

        collector.once('collect', async () => {
            collector.stop();
            try {
                await dice.delete();
                await this.commandExecute(interaction);
            } catch {}
        });
    }
};
