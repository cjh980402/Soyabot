import { ApplicationCommandOptionType } from 'discord.js';
import { MapleUser } from '../classes/MapleParser.js';

export const type = '메이플';
export const commandData = {
    name: '이미지',
    description: '해당 캐릭터의 배경 없는 이미지를 출력합니다.',
    options: [
        {
            name: '닉네임',
            type: ApplicationCommandOptionType.String,
            description: '이미지를 출력할 캐릭터의 닉네임',
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

    await interaction.followUp({
        content: `${mapleUserInfo.Name}님의 캐릭터 이미지`,
        files: [mapleUserInfo.userImg()]
    });
}
