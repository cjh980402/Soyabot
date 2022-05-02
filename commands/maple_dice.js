import { Attachment, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { exec } from '../admin/admin_function.js';

async function getDiceAttachment(nickname) {
    const { stdout: dicePic } = await exec(
        `python3 ./util/python/maple_stat_dice.py '${nickname.replace(/'/g, '$&"$&"$&')}'`,
        { encoding: 'buffer' }
    );
    // 파이썬 스크립트 실행, 쉘에서 작은 따옴표로 감싸서 쉘 특수문자 이스케이핑, 닉네임의 작은 따옴표는 별도로 이스케이핑

    return new Attachment(dicePic, 'dice.png');
}

export const type = '메이플';
export const commandData = {
    name: '데굴데굴',
    description: '추억의 메이플스토리 주사위!'
};
export async function commandExecute(interaction) {
    const nickname = interaction.member?.nickname ?? interaction.user.username;
    const image = await getDiceAttachment(nickname);
    const row = new ActionRowBuilder().addComponents([
        new ButtonBuilder().setCustomId('repeat').setEmoji('🎲').setStyle(ButtonStyle.Secondary)
    ]);
    let count = 1;
    const dice = await interaction.followUp({
        content: `${nickname}님의 ${count}번째 스탯 주사위`,
        files: [image],
        components: [row]
    });

    const collector = dice.createMessageComponentCollector({
        filter: (itr) => itr.user.id === interaction.user.id,
        time: 120000
    });

    collector
        .on('collect', async (itr) => {
            try {
                const nickname = interaction.member?.nickname ?? interaction.user.username;
                const image = await getDiceAttachment(nickname);
                await itr.update({ content: `${nickname}님의 ${++count}번째 스탯 주사위`, files: [image] });
            } catch {}
        })
        .once('end', async () => {
            try {
                row.components[0].setDisabled(true);
                await dice.edit({ components: [row] });
            } catch {}
        });
}
