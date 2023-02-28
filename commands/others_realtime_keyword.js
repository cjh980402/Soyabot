import { request } from 'undici';

export const type = '기타';
export const commandData = {
    name: '실검',
    description: 'https://www.signal.bz 기준 실시간 검색어를 보여줍니다.'
};
export async function commandExecute(interaction) {
    const { body } = await request('https://api.signal.bz/news/realtime');
    const data = await body.json();
    await interaction.followUp(
        `[실시간 검색어(링크)](<https://www.signal.bz>)\n${new Date().toLocaleString()}\n\n${data.top10
            .map((v) => `${v.rank}. ${v.keyword}`)
            .join('\n')}`
    );
}
