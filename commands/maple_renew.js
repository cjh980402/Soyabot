import { ApplicationCommandOptionType } from 'discord.js';
import { MapleUser } from '../classes/MapleParser.js';

export const type = '메이플';
export const commandData = {
    name: '갱신',
    description: '캐릭터의 maple.GG 정보를 갱신합니다.',
    options: [
        {
            name: '닉네임',
            type: ApplicationCommandOptionType.String,
            description: '정보를 갱신할 캐릭터의 닉네임',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    const mapleUserInfo = new MapleUser(interaction.options.getString('닉네임'));
    if (!(await mapleUserInfo.homeLevel())) {
        return interaction.followUp(`[${mapleUserInfo.Name}]\n존재하지 않는 캐릭터입니다.`);
    }

    if (await mapleUserInfo.isLatest()) {
        await interaction.followUp(
            `[${mapleUserInfo.Name}]\n갱신이 완료되었습니다.\n\n${decodeURI(mapleUserInfo.GGURL)}`
        );
    } else {
        await interaction.followUp('제한시간 내에 갱신 작업을 실패했습니다.');
    }
}
