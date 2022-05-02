import { ApplicationCommandOptionType } from 'discord.js';
import { MapleUser } from '../classes/MapleParser.js';

export const type = '메이플';
export const commandData = {
    name: '업적',
    description: '캐릭터의 업적 등급, 점수, 랭킹을 출력합니다.',
    options: [
        {
            name: '닉네임',
            type: ApplicationCommandOptionType.String,
            description: '업적 정보를 검색할 캐릭터의 닉네임',
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

    const rslt = mapleUserInfo.Achieve();
    if (!rslt) {
        await interaction.followUp(`[${mapleUserInfo.Name}]\n기록이 없습니다.`);
    } else {
        await interaction.followUp(
            `[${mapleUserInfo.Name}]\n등급: ${rslt[0]}\n업적점수: ${rslt[1]}\n월드랭킹: ${rslt[2]}\n전체랭킹: ${rslt[3]}`
        );
    }
}
