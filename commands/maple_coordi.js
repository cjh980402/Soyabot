import { AttachmentBuilder, EmbedBuilder, ApplicationCommandOptionType } from 'discord.js';
import { MapleUser } from '../classes/MapleParser.js';

export const type = '메이플';
export const commandData = {
    name: '코디',
    description: '해당 캐릭터가 착용한 코디템과 헤어, 성형을 출력합니다.',
    options: [
        {
            name: '닉네임',
            type: ApplicationCommandOptionType.String,
            description: '코디 정보를 출력할 캐릭터의 닉네임',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    const mapleUserInfo = new MapleUser(interaction.options.getString('닉네임'));

    if (!(await mapleUserInfo.homeLevel())) {
        return interaction.followUp(`[${mapleUserInfo.Name}]\n존재하지 않는 캐릭터입니다.`);
    }
    if (!(await mapleUserInfo.isLatest())) {
        await interaction.followUp('제한시간 내에 갱신 작업을 실패했습니다.');
    }

    const coordi = mapleUserInfo.Coordi();
    if (!coordi) {
        await interaction.followUp(`[${mapleUserInfo.Name}]\n코디 정보가 없습니다.`);
    } else {
        const image = new AttachmentBuilder(mapleUserInfo.userImg(), { name: 'character.png' });
        const coordiEmbed = new EmbedBuilder()
            .setTitle(`**${mapleUserInfo.Name}님의 코디**`)
            .setColor('#FF9999')
            .setURL(mapleUserInfo.GGURL)
            .setImage('attachment://character.png')
            .addFields([
                { name: '**헤어**', value: coordi.hair?.[1] ?? '-', inline: true },
                { name: '**성형**', value: coordi.face?.[1] ?? '-', inline: true },
                { name: '**모자**', value: coordi.cap?.[1] ?? '-', inline: true },
                { name: '**상의**', value: coordi.coat?.[1] ?? '-', inline: true },
                { name: '**하의**', value: coordi.pants?.[1] ?? '-', inline: true },
                { name: '**신발**', value: coordi.shoes?.[1] ?? '-', inline: true },
                { name: '**무기**', value: coordi.weapon?.[1] ?? '-', inline: true }
            ]);

        await interaction.followUp({ embeds: [coordiEmbed], files: [image] });
    }
}
