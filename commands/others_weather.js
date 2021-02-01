const { MessageEmbed } = require("discord.js");
const fetch = require('node-fetch');
const cheerio = require('cheerio');

function generateWeatherEmbed(local, weather) {
    const embeds = [];
    for (let i = 0; i < weather.length; i++) {
        const embed = new MessageEmbed()
            .setTitle(`**${local}**`)
            .setColor("#FF9899")
            .setDescription(weather[i])
            .setTimestamp();

        if (embed.description.length > 2000) {
            embed.description = `${embed.description.substr(0, 1950)}...`;
        }
        embeds.push(embed);
    }
    return embeds;
}

module.exports = {
    usage: `${client.prefix}날씨 (지역)`,
    command: ["날씨", "ㄴㅆ"],
    description: "- 입력한 지역의 날씨를 알려줍니다.",
    channelCool: true,
    type: ["기타"],
    async execute(message, args) {
        const search = args.length > 0 ? args.join(" ") : "동대문구 전농동";
        const searchRslt = (await (await fetch(`https://ac.weather.naver.com/ac?q_enc=utf-8&r_format=json&r_enc=utf-8&r_lt=1&st=1&q=${encodeURI(search)}`)).json()).items[0];
        let targetLocal;
        if (!searchRslt?.length) {
            return message.channel.send("검색된 지역이 없습니다.");
        }
        else if (searchRslt.length == 1) {
            targetLocal = searchRslt[0];
        }
        else {
            const locallistEmbed = new MessageEmbed()
                .setTitle("**검색된 지역**")
                .setDescription(searchRslt.map((v, i) => `${i + 1}. ${v[0]}`))
                .setColor("#FF9899")
                .setTimestamp();
            message.channel.send(locallistEmbed);

            const rslt = await message.channel.awaitMessages((msg) => (msg.author.id == message.author.id && !isNaN(msg.content) && 1 <= +msg.content && +msg.content <= searchRslt.length), { max: 1, time: 20000, errors: ["time"] });
            targetLocal = searchRslt[+rslt.first().content - 1];
        }

        const parse = cheerio.load(await (await fetch(`https://weather.naver.com/today/${targetLocal[1][0]}`)).text());
        const nowWeather = parse(".weather_area");
        let weather1 = `현재 날씨\n\n현재온도: ${nowWeather.find(".current").contents()[1].data}° (${nowWeather.find(".summary > .weather").text()})`;

        const summaryTerm = nowWeather.find(".summary_list > .term");
        const summaryDesc = nowWeather.find(".summary_list > .desc");
        for (let i = 0; i < summaryTerm.length; i++) {
            weather1 += `${i % 2 ? " | " : "\n"}${summaryTerm.eq(i).text()}: ${summaryDesc.eq(i).text()}`;
        }

        const todayInfo = parse(".today_chart_list .item_inner");
        for (let i = 0; i < todayInfo.length; i++) {
            weather1 += `${i % 2 ? " | " : "\n"}${todayInfo.eq(i).find(".ttl").text()}: ${todayInfo.eq(i).find(".level_text").text()}`;
        }

        const weather = parse(".time_list > .item_time");
        const rainData = parse('div[data-name="rain"] .row_graph').eq(0); // 가끔 적설량이 병기되는 경우에 대응
        const rainName = rainData.find('.blind').text();
        const rainUnit = rainName == "적설량" ? "㎝" : "㎜";
        const rain = rainData.find('.data');
        const humidity = parse('div[data-name="humidity"] .row_graph > .data');
        const wind = parse('div[data-name="wind"] .row_graph > .data');
        let raintemp = 0, weather2 = "날씨 예보\n";

        for (let i = 0, j = 0; i < weather.length - 1; i++) {
            weather2 += `\n${weather.eq(i).find(".time").text()}: ${weather.eq(i).attr("data-tmpr")}° (${weather.eq(i).attr("data-wetr-txt")}) | ${rainName}: ${rain.eq(j).text().trim()}${rainUnit} | 습도: ${humidity.eq(i).text().trim()}% | 풍속: ${wind.eq(i).text().trim()}㎧`;
            if (raintemp) {
                raintemp--;
            }
            else {
                j++;
                raintemp = +rain.eq(j).attr("colspan") - 1;
            }
        }

        let currentPage = 0;
        const embeds = generateWeatherEmbed(targetLocal[0][0], [weather1, weather2]);
        const weatherEmbed = await message.channel.send(
            `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
            embeds[currentPage]
        );

        try {
            await weatherEmbed.react("⬅️");
            await weatherEmbed.react("⏹");
            await weatherEmbed.react("➡️");
        }
        catch {
            return message.channel.send("**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**");
        }
        const filter = (reaction, user) => message.author.id == user.id;
        const collector = weatherEmbed.createReactionCollector(filter, { time: 60000 });

        collector.on("collect", async (reaction, user) => {
            try {
                if (message.guild) {
                    await reaction.users.remove(user);
                }
                if (reaction.emoji.name == "➡️") {
                    currentPage = (currentPage + 1) % embeds.length;
                    weatherEmbed.edit(`**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                }
                else if (reaction.emoji.name == "⬅️") {
                    currentPage = (currentPage - 1 + embeds.length) % embeds.length;
                    weatherEmbed.edit(`**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                }
                else if (reaction.emoji.name == "⏹") {
                    collector.stop();
                }
            }
            catch {
                return message.channel.send("**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**");
            }
        });
    }
};
