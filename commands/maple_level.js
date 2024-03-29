import { ApplicationCommandOptionType } from 'discord.js';
import { MapleAPI } from '../classes/MapleParser.js';
import { levelTable } from '../util/Constant.js';
import { Util } from '../util/Util.js';

export const type = '메이플';
export const commandData = {
    name: '레벨',
    description: '캐릭터의 OPEN API 실시간 조회 레벨과 경험치를 기준으로 250, 275, 300까지 남은 경험치량을 계산합니다.',
    options: [
        {
            name: '닉네임',
            type: ApplicationCommandOptionType.String,
            description: '레벨 정보를 검색할 캐릭터의 닉네임',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    const nickname = interaction.options.getString('닉네임');

    const mapleApiInfo = new MapleAPI(nickname);
    const basicInfo = await mapleApiInfo.ApiRequest('character/basic');
    const char_lv = basicInfo.character_level;
    const char_ex = basicInfo.character_exp;

    let rslt = `[${basicInfo.character_name}]\n직업: ${basicInfo.character_class}\n현재: Lv.${char_lv}`;
    if (char_lv < 300) {
        const sumExp = levelTable[char_lv - 1] + char_ex;
        const percentage = ((char_ex / (levelTable[char_lv] - levelTable[char_lv - 1])) * 100).toFixed(3);
        rslt += ` (${percentage}%)`;

        const req_300 = Util.toUnitString(levelTable[299] - sumExp, 2);
        if (char_lv < 275) {
            const req_275 = Util.toUnitString(levelTable[274] - sumExp, 2);
            if (char_lv < 250) {
                const req_250 = Util.toUnitString(levelTable[249] - sumExp, 2);
                rslt += `\n잔여량 (~250): ${req_250}\n진행률 (~250): ${((sumExp / levelTable[249]) * 100).toFixed(3)}%`;
            }
            rslt += `\n잔여량 (~275): ${req_275}\n진행률 (~275): ${((sumExp / levelTable[274]) * 100).toFixed(3)}%`;
        }
        rslt += `\n잔여량 (~300): ${req_300}\n진행률 (~300): ${((sumExp / levelTable[299]) * 100).toFixed(3)}%`;
    }
    await interaction.followUp(rslt);
}
