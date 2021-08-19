const { MessageEmbed, Collection } = require('../util/discord.js-extend');
const { youtubeSearch } = require('../util/song_util');

module.exports = {
    usage: `${client.prefix}search (영상 제목)`,
    command: ['search', 's'],
    description: '- 재생할 노래를 검색하고 선택합니다. (,로 구분하여 여러 노래 선택 가능)',
    type: ['음악'],
    async messageExecute(message, args) {
        if (!message.guildId) {
            return message.reply('사용이 불가능한 채널입니다.'); // 길드 여부 체크
        }
        if (args.length < 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        if (!message.member.voice.channel) {
            return message.reply('음성 채널에 먼저 참가해주세요!');
        }

        const search = args.join(' ');
        const results = await youtubeSearch(search);
        if (!results) {
            return message.reply('검색 내용에 해당하는 영상을 찾지 못했습니다.');
        }

        const resultsEmbed = new MessageEmbed().setTitle('**재생할 노래의 번호를 알려주세요.**').setDescription(`${search}의 검색 결과`).setColor('#FF9999');
        results.forEach((video, index) => resultsEmbed.addField(`**${index + 1}. ${video.title}**`, `https://youtu.be/${video.id}`));
        // results.forEach((video, index) => resultsEmbed.addField(`**${index + 1}. ${video.title.decodeHTML().decodeHTML()}**`, video.shortURL));

        const resultsMessage = await message.channel.send({ embeds: [resultsEmbed] });

        try {
            let songChoice;
            const rslt = await message.channel.awaitMessages({
                filter: (msg) =>
                    msg.author.id === message.author.id &&
                    (songChoice = msg.content
                        .split(',')
                        .map((str) => Math.trunc(str))
                        .deduplication()).every((v) => !isNaN(v) && 1 <= v && v <= results.length),
                max: 1,
                time: 20000,
                errors: ['time']
            });

            const playCommand = client.commands.find((cmd) => cmd.command.includes('play'));
            for (const song of songChoice) {
                await playCommand.messageExecute(message, [resultsEmbed.fields[song - 1].value]);
            }

            try {
                await rslt.first().delete();
            } catch {}
        } catch (err) {
            if (!(err instanceof Collection)) {
                throw err; // 시간초과 에러(Collection<Snowflake, Message>)가 아닌 경우 에러를 다시 throw
            }
        } finally {
            try {
                await resultsMessage.delete();
            } catch {}
        }
    },
    commandData: {
        name: 'search',
        description: '재생할 노래를 검색하고 선택합니다. (,로 구분하여 여러 노래 선택 가능)',
        options: [
            {
                name: '영상_제목',
                type: 'STRING',
                description: '검색할 노래의 영상 제목',
                required: true
            }
        ]
    },
    async commandExecute(interaction) {
        if (!interaction.guildId) {
            return interaction.followUp('사용이 불가능한 채널입니다.'); // 길드 여부 체크
        }
        if (!interaction.member.voice.channel) {
            return interaction.followUp('음성 채널에 먼저 참가해주세요!');
        }

        const search = interaction.options.getString('영상_제목');
        const results = await youtubeSearch(search);
        if (!results) {
            return interaction.followUp('검색 내용에 해당하는 영상을 찾지 못했습니다.');
        }

        const resultsEmbed = new MessageEmbed().setTitle('**재생할 노래의 번호를 알려주세요.**').setDescription(`${search}의 검색 결과`).setColor('#FF9999');
        results.forEach((video, index) => resultsEmbed.addField(`**${index + 1}. ${video.title}**`, `https://youtu.be/${video.id}`));
        // results.forEach((video, index) => resultsEmbed.addField(`**${index + 1}. ${video.title.decodeHTML().decodeHTML()}**`, video.shortURL));

        const resultsMessage = await interaction.editReply({ embeds: [resultsEmbed] });

        try {
            let songChoice;
            const rslt = await interaction.channel.awaitMessages({
                filter: (msg) =>
                    msg.author.id === interaction.user.id &&
                    (songChoice = msg.content
                        .split(',')
                        .map((str) => Math.trunc(str))
                        .deduplication()).every((v) => !isNaN(v) && 1 <= v && v <= results.length),
                max: 1,
                time: 20000,
                errors: ['time']
            });

            const playCommand = client.commands.find((cmd) => cmd.commandData?.name === 'play');
            for (const song of songChoice) {
                interaction.options._hoistedOptions[1] = { name: '영상_주소_제목', type: 'STRING', value: resultsEmbed.fields[song - 1].value };
                await playCommand.commandExecute(interaction);
            }

            try {
                await rslt.first().delete();
            } catch {}
        } catch (err) {
            if (!(err instanceof Collection)) {
                throw err; // 시간초과 에러(Collection<Snowflake, Message>)가 아닌 경우 에러를 다시 throw
            }
        } finally {
            try {
                await resultsMessage.delete();
            } catch {}
        }
    }
};
