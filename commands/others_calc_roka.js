import { ApplicationCommandOptionType } from 'discord.js';

export const type = ['기타'];
export const commandData = {
    name: '입대',
    description: 'YYMMDD 형식으로 입력한 입대일을 기준으로 전역일을 계산해줍니다. (육군 기준)',
    options: [
        {
            name: '입대일',
            type: ApplicationCommandOptionType.String,
            description: '전역일을 계산할 대상의 입대일',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    const date = /^(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/.exec(interaction.options.getString('입대일'));
    // 올바른 YYMMDD 형식인지 확인하는 정규식 → 인덱스 1: 연도, 2: 월, 3: 일
    if (!date) {
        return interaction.followUp('잘못된 형식의 날짜를 입력했습니다. YYMMDD 형식으로 입대일을 입력해주세요.');
    }

    const year = +date[1] + 2000;
    const mon = +date[2];
    const day = +date[3];
    const stdday = new Date(2017, 1 - 1, 3); // 2017. 01. 03. 부터 2주마다 1일씩 단축
    const after18 = new Date(2020, 6 - 1, 16); // 2020. 06. 16. 부터 18개월 복무
    const start = new Date(year, mon - 1, day);
    const before = new Date(year + 2, mon - 1 - 3, day - 1); // 단축 전 전역일
    if (start < stdday) {
        // 21개월 복무
        await interaction.followUp(
            `입대일: ${start.toLocaleDateString()}\n전역일: ${before.toLocaleDateString()}\n전체 복무일: ${
                (before - start) / 86400000
            }일`
        );
    } else {
        const minusday = Math.floor((start - stdday) / (86400000 * 14) + 1); // 단축일 수 계산
        const after =
            start >= after18 ? new Date(year + 2, mon - 1 - 6, day - 1) : new Date(before - minusday * 86400000); // 전자는 18개월 복무
        await interaction.followUp(
            `입대일: ${start.toLocaleDateString()}\n단축 전 전역일: ${before.toLocaleDateString()}\n${
                start >= after18 ? `복무기간이 18개월입니다.\n` : `단축일 수: ${minusday}일\n`
            }단축 후 전역일: ${after.toLocaleDateString()}\n전체 복무일: ${(after - start) / 86400000}일${
                new Date() > after
                    ? ''
                    : `\n현재 복무율: ${((Math.max(new Date() - start, 0) / (after - start)) * 100).toFixed(
                          2
                      )}%\n전역까지 ${Math.ceil((after - new Date()) / 86400000)}일 남았습니다.`
            }`
        );
    }
}
