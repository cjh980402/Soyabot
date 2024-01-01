import { ApplicationCommandOptionType } from 'discord.js';
import { MapleUser } from '../classes/MapleParser.js';

export const type = '메이플';
export const commandData = {
    name: '랭킹',
    description: '캐릭터의 랭킹을 출력합니다.',
    options: [
        {
            name: '닉네임',
            type: ApplicationCommandOptionType.String,
            description: '랭킹을 출력할 캐릭터의 닉네임',
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

    const rank = mapleUserInfo.Rank();
    if (!rank) {
        await interaction.followUp(`[${mapleUserInfo.Name}]\n랭킹 정보를 가져오지 못했습니다.`);
    } else {
        await interaction.followUp(
            `[${
                mapleUserInfo.Name
            }]\n종합 랭킹(전체): ${rank[0].toLocaleString()}위\n종합 랭킹(월드): ${rank[1].toLocaleString()}위\n직업 랭킹(전체): ${rank[2].toLocaleString()}위\n직업 랭킹(월드): ${rank[3].toLocaleString()}위`
        );
    }
}
