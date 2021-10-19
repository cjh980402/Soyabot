import { cmd } from '../admin/admin_function.js';
import { MessageAttachment, MessageActionRow, MessageButton } from '../util/discord.js-extend.js';

export const usage = `${client.prefix}데굴데굴`;
export const command = ['데굴데굴', 'ㄷㄱㄷㄱ'];
export const description = '- 추억의 메이플스토리 주사위!';
export const type = ['메이플'];
export async function messageExecute(message) {
    const nickname = message.member?.nickname ?? message.author.username;
    const { stdout: dicePic } = await cmd(
        `python3 ./util/maple_stats_drawer.py '${nickname.replace(/'/g, '$&"$&"$&')}'`,
        { encoding: 'buffer' }
    );
    // 파이썬 스크립트 실행, 쉘에서 작은 따옴표로 감싸서 쉘 특수문자 이스케이핑, 닉네임의 작은 따옴표는 별도로 이스케이핑
    const image = new MessageAttachment(dicePic, 'dice.png');
    const row = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('repeat').setEmoji('🎲').setStyle('SECONDARY')
    );
    const dice = await message.channel.send({ content: `${nickname}님의 스탯`, files: [image], components: [row] });

    const filter = (itr) => itr.customId === 'repeat' && message.author.id === itr.user.id;
    const collector = dice.createMessageComponentCollector({ filter, time: 120000 });

    collector.once('collect', async () => {
        collector.stop();
        try {
            await dice.delete();
            await this.messageExecute(message);
        } catch {}
    });
}
export const commandData = {
    name: '데굴데굴',
    description: '추억의 메이플스토리 주사위!'
};
export async function commandExecute(interaction) {
    const nickname = interaction.member?.nickname ?? interaction.user.username;
    const { stdout: dicePic } = await cmd(
        `python3 ./util/maple_stats_drawer.py '${nickname.replace(/'/g, '$&"$&"$&')}'`,
        { encoding: 'buffer' }
    );
    // 파이썬 스크립트 실행, 쉘에서 작은 따옴표로 감싸서 쉘 특수문자 이스케이핑, 닉네임의 작은 따옴표는 별도로 이스케이핑
    try {
        await interaction.deleteReply();
    } catch {}
    const image = new MessageAttachment(dicePic, 'dice.png');
    const row = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('repeat').setEmoji('🎲').setStyle('SECONDARY')
    );
    const dice = await interaction.channel.send({ content: `${nickname}님의 스탯`, files: [image], components: [row] });

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
