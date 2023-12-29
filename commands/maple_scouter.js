import { AttachmentBuilder, EmbedBuilder, ApplicationCommandOptionType } from 'discord.js';
import { MapleAPI } from '../classes/MapleParser.js';

function getScouterEmbed(basicInfo, statInfo) {
    const getStatValue = (name) => {
        const value = statInfo.final_stat.find((v) => v.stat_name === name)?.stat_value;
        return value ? (+value).toLocaleString() : '-';
    };

    return new EmbedBuilder()
        .setTitle(`**${basicInfo.character_name}님의 스탯 정보**`)
        .setColor('#FF9999')
        .setImage('attachment://character.png')
        .addFields([
            { name: '**직업**', value: basicInfo.character_class, inline: true },
            { name: '**레벨**', value: String(basicInfo.character_level), inline: true },
            { name: '**STR**', value: getStatValue('STR'), inline: true },
            { name: '**DEX**', value: getStatValue('DEX'), inline: true },
            { name: '**INT**', value: getStatValue('INT'), inline: true },
            { name: '**LUK**', value: getStatValue('LUK'), inline: true },
            { name: '**HP**', value: getStatValue('HP'), inline: true },
            { name: '**전투력**', value: getStatValue('전투력') }
        ]);
}

export const type = '메이플';
export const commandData = {
    name: '스카우터',
    description: '해당 캐릭터의 전투력 및 여러 스탯 정보를 공식 API 기준으로 출력합니다.',
    options: [
        {
            name: '닉네임',
            type: ApplicationCommandOptionType.String,
            description: '스탯 정보를 출력할 캐릭터의 닉네임',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    const nickname = interaction.options.getString('닉네임');

    const mapleApiInfo = new MapleAPI(nickname);
    const basicInfo = await mapleApiInfo.ApiRequest('character/basic');
    const statInfo = await mapleApiInfo.ApiRequest('character/stat');

    const image = new AttachmentBuilder(basicInfo.character_image?.replace('Character/', 'Character/180/'), {
        name: 'character.png'
    });
    await interaction.followUp({ embeds: [getScouterEmbed(basicInfo, statInfo)], files: [image] });
}
