import { MessageAttachment, MessageActionRow, MessageButton } from 'discord.js';
import { PREFIX } from '../soyabot_config.js';
import { exec } from '../admin/admin_function.js';

async function getDiceAttachment(nickname) {
    const { stdout: dicePic } = await exec(
        `python3 ./util/python/maple_stat_dice.py '${nickname.replace(/'/g, '$&"$&"$&')}'`,
        { encoding: 'buffer' }
    );
    // 파이썬 스크립트 실행, 쉘에서 작은 따옴표로 감싸서 쉘 특수문자 이스케이핑, 닉네임의 작은 따옴표는 별도로 이스케이핑

    return new MessageAttachment(dicePic, 'dice.png');
}

export const usage = `${PREFIX}데굴데굴`;
export const command = ['데굴데굴', 'ㄷㄱㄷㄱ'];
export const description = '- 추억의 메이플스토리 주사위!';
export const type = ['메이플'];
export async function messageExecute(message) {
    const nickname = message.member?.nickname ?? message.author.username;
    const image = await getDiceAttachment(nickname);
    const row = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('repeat').setEmoji('🎲').setStyle('SECONDARY')
    );
    let count = 1;
    const dice = await message.channel.send({
        content: `${nickname}님의 ${count}번째 스탯 주사위`,
        files: [image],
        components: [row]
    });

    const filter = (itr) => itr.customId === 'repeat' && message.author.id === itr.user.id;
    const collector = dice.createMessageComponentCollector({ filter, time: 120000 });

    collector
        .on('collect', async () => {
            try {
                const nickname = message.member?.nickname ?? message.author.username;
                const image = await getDiceAttachment(nickname);
                await dice.edit({ content: `${nickname}님의 ${++count}번째 스탯 주사위`, files: [image] });
            } catch {}
        })
        .once('end', async () => {
            try {
                // 주사위 메시지의 버튼 비활성화
                row.components[0].setDisabled(true);
                await dice.edit({ components: [row] });
            } catch {}
        });
}
export const commandData = {
    name: '데굴데굴',
    description: '추억의 메이플스토리 주사위!'
};
export async function commandExecute(interaction) {
    const nickname = interaction.member?.nickname ?? interaction.user.username;
    const image = await getDiceAttachment(nickname);
    const row = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('repeat').setEmoji('🎲').setStyle('SECONDARY')
    );
    let count = 1;
    const dice = await interaction.editReply({
        content: `${nickname}님의 ${count}번째 스탯 주사위`,
        files: [image],
        components: [row]
    });

    const filter = (itr) => itr.customId === 'repeat' && interaction.user.id === itr.user.id;
    const collector = dice.createMessageComponentCollector({ filter, time: 120000 });

    collector
        .on('collect', async () => {
            try {
                const nickname = interaction.member?.nickname ?? interaction.user.username;
                const image = await getDiceAttachment(nickname);
                await dice.edit({ content: `${nickname}님의 ${++count}번째 스탯 주사위`, files: [image] });
            } catch {}
        })
        .once('end', async () => {
            try {
                // 주사위 메시지의 버튼 비활성화
                row.components[0].setDisabled(true);
                await dice.edit({ components: [row] });
            } catch {}
        });
}
