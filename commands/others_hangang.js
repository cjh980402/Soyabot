import { request } from 'undici';

export const type = '기타';
export const commandData = {
    name: '한강',
    description: '현재 한강의 수온을 알려줍니다.'
};
export async function commandExecute(interaction) {
    const params = new URLSearchParams();
    params.set('schFrDate', '');
    params.set('schEnDate', '');
    params.set('currentPage', 1);
    params.set('siteId', '노량진_자동');

    const { body } = await request('https://swo.seoul.go.kr/water/waterMesntkInfoResult.do', {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: params.toString()
    });
    const data = await body.json();

    const result = data.resultList.find((v) => v.W_TEMP);
    if (!result) {
        await interaction.followUp('측정된 한강 수온 데이터가 없습니다.');
    } else {
        await interaction.followUp(
            `한강 수온: ${result.W_TEMP}°C\n업데이트 시간: ${result.MSR_DATE.replace(
                /(\d{4})(\d{2})(\d{2})/,
                '$1년 $2월 $3일'
            )} ${result.MSR_TIME.split(':')[0]}시`
        );
    }
}
