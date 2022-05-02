import { EmbedBuilder, ApplicationCommandOptionType } from 'discord.js';
import { request } from 'undici';
import { load } from 'cheerio';
import { Util } from '../util/Util.js';

async function getLyricsEmbed(search) {
    const lyricsEmbed = new EmbedBuilder().setColor('#FF9999');
    const { body: songBody } = await request(
        `https://www.melon.com/search/song/index.htm?q=${encodeURIComponent(search)}`
    );
    const songData = load(await songBody.text())('input[name="input_check"]'); // length가 검색 결과 수
    const { body: lyricBody } = await request(
        `https://www.melon.com/search/lyric/index.htm?q=${encodeURIComponent(search)}`
    );
    const lyricData = load(await lyricBody.text())('.list_lyric .cntt_lyric .btn.btn_icon_detail'); // length가 검색 결과 수
    const songId = songData.eq(0).attr('value') ?? lyricData.eq(0).attr('data-song-no');

    if (songId) {
        const { body } = await request(`https://www.melon.com/song/detail.htm?songId=${songId}`);
        const $ = load(await body.text());
        const title = $('.song_name').contents().last().text().trim();
        const is19 = $('.song_name .bullet_icons.age_19.large').length;
        const artist = $('.artist').eq(0).text().trim();
        const lyrics = $('.lyric')
            .contents()
            .get()
            .filter((v) => v.type === 'text' || v.name === 'br')
            .map((v) => v.data ?? '\n')
            .join('')
            .trim(); // 멜론 사이트 소스 오타 대응
        lyricsEmbed
            .setTitle(`**'${title} - ${artist}'의 가사**`)
            .setDescription(
                Util.splitMessage(lyrics)[0] || `${is19 ? '연령 제한이 있는' : '등록된 가사가 없는'} 콘텐츠입니다.`
            );
    } else {
        lyricsEmbed.setTitle(`**'${search}'의 가사**`).setDescription('검색된 노래가 없습니다.');
    }

    return lyricsEmbed;
}

export const type = '음악';
export const commandData = {
    name: 'lyrics',
    description: '입력한 노래의 가사를 출력합니다. 노래 제목을 생략 시에는 현재 재생 중인 노래의 가사를 출력합니다.',
    options: [
        {
            name: '노래_제목',
            type: ApplicationCommandOptionType.String,
            description: '가사를 검색할 노래 제목'
        }
    ]
};
export async function commandExecute(interaction) {
    const queue = interaction.client.queues.get(interaction.guildId);
    const search = interaction.options.getString('노래_제목') ?? queue?.songs[0].title;
    if (!search) {
        return interaction.followUp('검색할 노래가 없습니다.');
    }

    await interaction.followUp({ embeds: [await getLyricsEmbed(search)] });
}
