const fetch = require('node-fetch');

module.exports = {
    usage: `${client.prefix}실검`,
    command: ['실검', 'ㅅㄱ'],
    description: '- https://www.signal.bz 기준 네이버 실시간 검색어를 보여줍니다.',
    type: ['기타'],
    async messageExecute(message) {
        const data = await (await fetch('https://api.signal.bz/news/realtime')).json();
        return message.channel.send(`실시간 검색어\n${new Date().toLocaleString()}\n\n${data.top10.map((v) => `${v.rank}. ${v.keyword}`).join('\n')}`);
    },
    interaction: {
        name: '실검',
        description: 'https://www.signal.bz 기준 네이버 실시간 검색어를 보여줍니다.'
    },
    async commandExecute(interaction) {
        const data = await (await fetch('https://api.signal.bz/news/realtime')).json();
        return interaction.followUp(`실시간 검색어\n${new Date().toLocaleString()}\n\n${data.top10.map((v) => `${v.rank}. ${v.keyword}`).join('\n')}`);
    }
};
