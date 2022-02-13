import { request } from 'undici';

export const usage = `${client.prefix}실검`;
export const command = ['실검', 'ㅅㄱ'];
export const description = '- https://www.signal.bz 기준 실시간 검색어를 보여줍니다.';
export const type = ['기타'];
export async function messageExecute(message) {
    const { body } = await request('https://api.signal.bz/news/realtime');
    const data = await body.json();
    return message.channel.send(
        `실시간 검색어\n${new Date().toLocaleString()}\n\n${data.top10
            .map((v) => `${v.rank}. ${v.keyword}`)
            .join('\n')}`
    );
}
export const commandData = {
    name: '실검',
    description: 'https://www.signal.bz 기준 실시간 검색어를 보여줍니다.'
};
export async function commandExecute(interaction) {
    const { body } = await request('https://api.signal.bz/news/realtime');
    const data = await body.json();
    return interaction.followUp(
        `실시간 검색어\n${new Date().toLocaleString()}\n\n${data.top10
            .map((v) => `${v.rank}. ${v.keyword}`)
            .join('\n')}`
    );
}
