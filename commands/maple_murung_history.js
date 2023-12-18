import { ApplicationCommandOptionType } from 'discord.js';
import { MapleUser } from '../classes/MapleParser.js';

export const type = '메이플';
export const commandData = {
    name: '무릉히스토리',
    description: '캐릭터의 무릉도장 클리어 내역을 보여줍니다.',
    options: [
        {
            name: '닉네임',
            type: ApplicationCommandOptionType.String,
            description: '무릉히스토리를 검색할 캐릭터의 닉네임',
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

    const data = mapleUserInfo.MurungHistory();
    if (!data || data.length === 0) {
        await interaction.followUp(`[${mapleUserInfo.Name}]\n기록이 없습니다.`);
    } else {
        let rslt = `[${mapleUserInfo.Name}]`;
        for (const murungData of data) {
            rslt += `\n[${new Date(murungData[0]).toLocaleDateString()}]: ${murungData[1]}층`;
        }
        await interaction.followUp(rslt);
    }
}
