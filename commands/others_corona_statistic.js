const { MessageAttachment, MessageActionRow, MessageButton, MessageEmbed } = require('../util/discord.js-extend');
const { CORONA_API_KEY } = require('../soyabot_config.json');
const fetch = require('node-fetch');

function calcIncrease(data) {
    return `${data >= 0 ? `⬆️ ${data.toLocaleString()}` : `⬇️ ${(-data).toLocaleString()}`}`;
}

async function getCoronaEmbed(countData, countryData) {
    const updateDate = /\((.+)\)/.exec(countData.updateTime)[1];
    const todayRecover = +countData.TodayRecovered;
    const todayCase = +countData.TotalCaseBefore;
    const todayDeath = +countData.TodayDeath;
    const todaySum = todayRecover + todayCase + todayDeath;

    const corona1 = new MessageEmbed()
        .setTitle(`**${updateDate}**`)
        .setThumbnail('attachment://mohw.png')
        .setColor('#FF9999')
        .setURL('http://ncov.mohw.go.kr')
        .addField('**확진 환자**', `${countData.TotalCase} (${calcIncrease(todaySum)})`)
        .addField('**격리 해제**', `${countData.TotalRecovered} (${calcIncrease(todayRecover)})`)
        .addField('**격리 중**', `${countData.NowCase} (${calcIncrease(todayCase)})`)
        .addField('**사망자**', `${countData.TotalDeath} (${calcIncrease(todayDeath)})`)
        .addField('**검사 중**', countData.checkingCounter)
        .setTimestamp();

    const rslt = Object.values(countryData)
        .filter((v) => v instanceof Object)
        .sort((a, b) => +b.newCase.replace(/,/g, '') - +a.newCase.replace(/,/g, ''))
        .map((v) => `${v.countryName}: ${v.totalCase} (국내: ⬆️ ${v.newCcase}, 해외: ⬆️ ${v.newFcase})`);
    const corona2 = new MessageEmbed()
        .setTitle('**지역별 확진 환자 현황**')
        .setThumbnail('attachment://mohw.png')
        .setColor('#FF9999')
        .setURL('http://ncov.mohw.go.kr')
        .setDescription(`${rslt.shift()}\n\n${rslt.join('\n')}`)
        .setTimestamp();

    return [corona1, corona2];
}

module.exports = {
    usage: `${client.prefix}코로나`,
    command: ['코로나', 'ㅋㄹㄴ'],
    description: '- 최신 기준 코로나 국내 현황 통계를 알려줍니다.',
    type: ['기타'],
    async messageExecute(message) {
        const countData = await (await fetch(`https://api.corona-19.kr/korea/?serviceKey=${CORONA_API_KEY}`)).json();
        const countryData = await (await fetch(`https://api.corona-19.kr/korea/country/new/?serviceKey=${CORONA_API_KEY}`)).json();

        if (countData.resultCode === '0' && countryData.resultCode === '0') {
            let currentPage = 0;
            const thumbnail = new MessageAttachment('./pictures/mohw.png');
            const embeds = await getCoronaEmbed(countData, countryData);
            const row = new MessageActionRow().addComponents(
                new MessageButton().setCustomId('prev').setEmoji('⬅️').setStyle('SECONDARY'),
                new MessageButton().setCustomId('stop').setEmoji('⏹️').setStyle('SECONDARY'),
                new MessageButton().setCustomId('next').setEmoji('➡️').setStyle('SECONDARY')
            );
            const coronaEmbed = await message.channel.send({
                content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
                embeds: [embeds[currentPage]],
                files: [thumbnail],
                components: [row]
            });

            const filter = (itr) => message.author.id === itr.user.id;
            const collector = coronaEmbed.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (itr) => {
                try {
                    switch (itr.customId) {
                        case 'next':
                            currentPage = (currentPage + 1) % embeds.length;
                            coronaEmbed.edit({ content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds: [embeds[currentPage]] });
                            break;
                        case 'prev':
                            currentPage = (currentPage - 1 + embeds.length) % embeds.length;
                            coronaEmbed.edit({ content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds: [embeds[currentPage]] });
                            break;
                        case 'stop':
                            collector.stop();
                            break;
                    }
                } catch {}
            });
        } else {
            return message.channel.send('코로나 현황을 조회할 수 없습니다.');
        }
    },
    commandData: {
        name: '코로나',
        description: '최신 기준 코로나 국내 현황 통계를 알려줍니다.'
    },
    async commandExecute(interaction) {
        const countData = await (await fetch(`https://api.corona-19.kr/korea/?serviceKey=${CORONA_API_KEY}`)).json();
        const countryData = await (await fetch(`https://api.corona-19.kr/korea/country/new/?serviceKey=${CORONA_API_KEY}`)).json();

        if (countData.resultCode === '0' && countryData.resultCode === '0') {
            let currentPage = 0;
            const thumbnail = new MessageAttachment('./pictures/mohw.png');
            const embeds = await getCoronaEmbed(countData, countryData);
            const row = new MessageActionRow().addComponents(
                new MessageButton().setCustomId('prev').setEmoji('⬅️').setStyle('SECONDARY'),
                new MessageButton().setCustomId('stop').setEmoji('⏹️').setStyle('SECONDARY'),
                new MessageButton().setCustomId('next').setEmoji('➡️').setStyle('SECONDARY')
            );
            const coronaEmbed = await interaction.editReply({
                content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
                embeds: [embeds[currentPage]],
                files: [thumbnail],
                components: [row]
            });

            const filter = (itr) => interaction.user.id === itr.user.id;
            const collector = coronaEmbed.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (itr) => {
                try {
                    switch (itr.customId) {
                        case 'next':
                            currentPage = (currentPage + 1) % embeds.length;
                            coronaEmbed.edit({ content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds: [embeds[currentPage]] });
                            break;
                        case 'prev':
                            currentPage = (currentPage - 1 + embeds.length) % embeds.length;
                            coronaEmbed.edit({ content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds: [embeds[currentPage]] });
                            break;
                        case 'stop':
                            collector.stop();
                            break;
                    }
                } catch {}
            });
        } else {
            return interaction.followUp('코로나 현황을 조회할 수 없습니다.');
        }
    }
};
