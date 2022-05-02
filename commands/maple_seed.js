import { ApplicationCommandOptionType } from 'discord.js';
import { MapleUser } from '../classes/MapleParser.js';

export const type = '메이플';
export const commandData = {
    name: '시드',
    description: '캐릭터의 직업, 시드 최고기록, 시간을 출력합니다.',
    options: [
        {
            name: '닉네임',
            type: ApplicationCommandOptionType.String,
            description: '시드 정보를 검색할 캐릭터의 닉네임',
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

    const seed = mapleUserInfo.Seed();
    if (!seed) {
        await interaction.followUp(`[${mapleUserInfo.Name}]\n기록이 없습니다.`);
    } else {
        await interaction.followUp(
            `[${mapleUserInfo.Name}]\n${seed[0]}\n기록: ${seed[1]}\n시간: ${seed[2]}\n날짜: ${seed[3]}`
        );
    }
}
