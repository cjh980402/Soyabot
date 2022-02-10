import { fetch } from 'undici';

export const usage = `${client.prefix}실검`;
export const command = ['실검', 'ㅅㄱ'];
export const description = '- https://www.signal.bz 기준 실시간 검색어를 보여줍니다.';
export const type = ['기타'];
export async function messageExecute(message) {
    const data = await (await fetch('https://api.signal.bz/news/realtime')).json();
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
    const data = await (await fetch('https://api.signal.bz/news/realtime')).json();
    return interaction.followUp(
        `실시간 검색어\n${new Date().toLocaleString()}\n\n${data.top10
            .map((v) => `${v.rank}. ${v.keyword}`)
            .join('\n')}`
    );
}
