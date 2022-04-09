import { PREFIX } from '../soyabot_config.js';
import { MapleUser } from '../classes/MapleParser.js';
import { levelTable } from '../util/soyabot_const.js';

export const usage = `${PREFIX}레벨 (닉네임)`;
export const command = ['레벨', 'ㄹㅂ', 'ㄼ'];
export const description = `- 캐릭터의 공식 홈페이지의 레벨과 경험치를 기준으로 250, 275, 300까지 남은 경험치량을 계산합니다.
- 이미 달성한 레벨에 대한 계산은 수행하지 않습니다.`;
export const type = ['메이플'];
export async function messageExecute(message, args) {
    if (args.length !== 1) {
        return message.channel.send(`**${usage}**\n- 대체 명령어: ${command.join(', ')}\n${description}`);
    }

    const mapleUserInfo = new MapleUser(args[0]);
    const level = await mapleUserInfo.homeLevel();
    if (!level) {
        return message.channel.send(`[${mapleUserInfo.Name}]\n존재하지 않는 캐릭터입니다.`);
    }

    const char_lv = level[0];
    const char_ex = level[1];

    let rslt = `[${mapleUserInfo.Name}]\n직업: ${level[4]}\n현재: Lv.${char_lv}`;
    if (char_lv < 300) {
        const sumExp = levelTable[char_lv - 1] + char_ex;
        const percentage = ((char_ex / (levelTable[char_lv] - levelTable[char_lv - 1])) * 100).toFixed(3);
        rslt += ` (${percentage}%)`;

        const req_300 = (levelTable[299] - sumExp).toUnitString(2);
        if (char_lv < 275) {
            const req_275 = (levelTable[274] - sumExp).toUnitString(2);
            if (char_lv < 250) {
                const req_250 = (levelTable[249] - sumExp).toUnitString(2);
                rslt += `\n잔여량 (~250): ${req_250}\n진행률 (~250): ${((sumExp / levelTable[249]) * 100).toFixed(3)}%`;
            }
            rslt += `\n잔여량 (~275): ${req_275}\n진행률 (~275): ${((sumExp / levelTable[274]) * 100).toFixed(3)}%`;
        }
        rslt += `\n잔여량 (~300): ${req_300}\n진행률 (~300): ${((sumExp / levelTable[299]) * 100).toFixed(3)}%`;
    }
    return message.channel.send(rslt);
}
export const commandData = {
    name: '레벨',
    description: '캐릭터의 공식 홈페이지의 레벨과 경험치를 기준으로 250, 275, 300까지 남은 경험치량을 계산합니다.',
    options: [
        {
            name: '닉네임',
            type: 'STRING',
            description: '레벨 정보를 검색할 캐릭터의 닉네임',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    const mapleUserInfo = new MapleUser(interaction.options.getString('닉네임'));

    const level = await mapleUserInfo.homeLevel();
    if (!level) {
        return interaction.followUp(`[${mapleUserInfo.Name}]\n존재하지 않는 캐릭터입니다.`);
    }

    const char_lv = level[0];
    const char_ex = level[1];

    let rslt = `[${mapleUserInfo.Name}]\n직업: ${level[4]}\n현재: Lv.${char_lv}`;
    if (char_lv < 300) {
        const sumExp = levelTable[char_lv - 1] + char_ex;
        const percentage = ((char_ex / (levelTable[char_lv] - levelTable[char_lv - 1])) * 100).toFixed(3);
        rslt += ` (${percentage}%)`;

        const req_300 = (levelTable[299] - sumExp).toUnitString(2);
        if (char_lv < 275) {
            const req_275 = (levelTable[274] - sumExp).toUnitString(2);
            if (char_lv < 250) {
                const req_250 = (levelTable[249] - sumExp).toUnitString(2);
                rslt += `\n잔여량 (~250): ${req_250}\n진행률 (~250): ${((sumExp / levelTable[249]) * 100).toFixed(3)}%`;
            }
            rslt += `\n잔여량 (~275): ${req_275}\n진행률 (~275): ${((sumExp / levelTable[274]) * 100).toFixed(3)}%`;
        }
        rslt += `\n잔여량 (~300): ${req_300}\n진행률 (~300): ${((sumExp / levelTable[299]) * 100).toFixed(3)}%`;
    }
    return interaction.followUp(rslt);
}
