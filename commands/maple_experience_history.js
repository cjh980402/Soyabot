import { ApplicationCommandOptionType } from 'discord.js';
import { MapleUser } from '../classes/MapleParser.js';

export const type = ['메이플'];
export const commandData = {
    name: '경험치히스토리',
    description: '캐릭터의 경험치 내역을 보여줍니다.',
    options: [
        {
            name: '닉네임',
            type: ApplicationCommandOptionType.String,
            description: '경험치히스토리를 검색할 캐릭터의 닉네임',
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

    const data = mapleUserInfo.ExpHistory();
    if (!data) {
        await interaction.followUp(`[${mapleUserInfo.Name}]\n경험치 히스토리를 가져오지 못했습니다.`);
    } else {
        let rslt = `[${mapleUserInfo.Name}]`;
        for (const expData of data) {
            rslt += `\n${expData.date}: Lv.${expData.level} (${expData.exp}%)`;
        }
        await interaction.followUp(rslt);
    }
}
