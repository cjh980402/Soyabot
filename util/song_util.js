const { createAudioResource, demuxProbe } = require('@discordjs/voice');
const { Client, Util } = require('soundcloud-scraper');
const scdl = new Client();
const { raw: ytdl } = require('youtube-dl-exec');
const { MAX_PLAYLIST_SIZE, GOOGLE_API_KEY } = require('../soyabot_config.json');
const YouTubeAPI = require('simple-youtube-api');
const youtube = new YouTubeAPI(GOOGLE_API_KEY);
const ytsr = require('ytsr');
const idRegex = /^[\w-]{11}$/;
const listRegex = /^[\w-]+$/;
const validPathDomains = /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/(embed|v|shorts)\/)/;
const validQueryDomains = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'gaming.youtube.com'];

module.exports.isValidVideo = function (url) {
    if (Util.validateURL(url, 'track') || module.exports.getYoutubeVideoID(url)) {
        return true;
    } else {
        return false;
    }
};

module.exports.isValidPlaylist = function (url) {
    if (Util.validateURL(url, 'playlist') || module.exports.getYoutubeListID(url)) {
        return true;
    } else {
        return false;
    }
};

module.exports.getYoutubeVideoID = function (url) {
    try {
        const parsed = new URL(url);
        let id = parsed.searchParams.get('v');
        if (validPathDomains.test(url) && !id) {
            const paths = parsed.pathname.split('/');
            id = paths[parsed.hostname === 'youtu.be' ? 1 : 2].substring(0, 11);
        } else if (!validQueryDomains.includes(parsed.hostname)) {
            return null;
        }
        return idRegex.test(id ?? '') ? id : null;
    } catch {
        return null;
    }
};

module.exports.getYoutubeListID = function (url) {
    try {
        const parsed = new URL(url);
        const id = parsed.searchParams.get('list');
        return validQueryDomains.includes(parsed.hostname) && listRegex.test(id ?? '') ? id : null;
    } catch {
        return null;
    }
};

module.exports.getSongInfo = async function (url, search) {
    try {
        let songInfo = null,
            song = null;
        if (Util.validateURL(url, 'track')) {
            songInfo = await scdl.getSongInfo(url);
            song = {
                title: songInfo.title,
                url: songInfo.url,
                duration: Math.ceil(songInfo.duration / 1000),
                thumbnail: songInfo.thumbnail
            };
        } else {
            let videoID = module.exports.getYoutubeVideoID(url);
            if (!videoID) {
                const filter = (await ytsr.getFilters(search)).get('Type').get('Video').url;
                videoID = filter && (await ytsr(filter, { limit: 1 })).items[0]?.id;
                // videoID = (await youtube.searchVideos(search, 1, { part: 'snippet' }))[0]?.id;
                if (!videoID) {
                    throw new Error('검색 내용에 해당하는 영상을 찾지 못했습니다.');
                }
            }
            songInfo = await youtube.getVideoByID(videoID);
            song = {
                title: songInfo.title.decodeHTML(),
                url: songInfo.url,
                duration: songInfo.durationSeconds,
                thumbnail: songInfo.maxRes.url
            };
        }
        return song;
    } catch {
        throw new Error('재생할 수 없는 영상입니다.');
    }
};

module.exports.getPlaylistInfo = async function (url, search) {
    try {
        let playlist = null,
            videos = null;
        if (Util.validateURL(url, 'playlist')) {
            playlist = await scdl.getPlaylist(url);
            videos = playlist.tracks
                .shuffle()
                .slice(0, MAX_PLAYLIST_SIZE)
                .map((track) => ({
                    title: track.title,
                    url: track.url,
                    duration: Math.ceil(track.duration / 1000),
                    thumbnail: track.thumbnail
                }));
        } else {
            let playlistID = module.exports.getYoutubeListID(url);
            if (!playlistID) {
                const filter = (await ytsr.getFilters(search)).get('Type').get('Playlist').url;
                playlistID = filter && (await ytsr(filter, { limit: 1 })).items[0]?.playlistID;
                // playlistID = (await youtube.searchPlaylists(search, 1, { part: 'snippet' }))[0]?.id;
                if (!playlistID) {
                    throw new Error('검색 내용에 해당하는 재생목록을 찾지 못했습니다.');
                }
            }
            playlist = await youtube.getPlaylistByID(playlistID, { part: 'snippet' });
            videos = (await playlist.getVideos(200, { part: 'snippet' }))
                .filter((video) => !/(Private|Deleted) video/.test(video.title)) // 비공개 또는 삭제된 영상 제외하기
                .shuffle()
                .slice(0, MAX_PLAYLIST_SIZE)
                .map((video) => video.id);
            videos = (await youtube.getVideosByIDs(videos)).map((video) => ({
                title: video.title.decodeHTML(),
                url: video.url,
                duration: video.durationSeconds,
                thumbnail: video.maxRes.url
            }));
        }
        videos.title = playlist.title;
        videos.url = playlist.url;
        return videos;
    } catch {
        throw new Error('재생할 수 없는 재생목록입니다.');
    }
};

module.exports.songDownload = async function (url) {
    const ytdlProcess = ytdl(
        url,
        {
            o: '-',
            q: '',
            f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
            r: '100K'
        },
        { stdio: ['ignore', 'pipe', 'ignore'] }
    );

    const stream = ytdlProcess.stdout;
    if (!stream) {
        throw new Error('출력 스트림이 존재하지 않습니다.');
    }

    const onError = () => {
        if (!ytdlProcess.killed) {
            ytdlProcess.kill();
        }
        stream.resume();
    };
    ytdlProcess.on('error', onError);
    stream.on('error', onError);

    try {
        const probe = await demuxProbe(stream);
        return createAudioResource(probe.stream, { inputType: probe.type, inlineVolume: true });
    } catch (err) {
        onError();
        throw err;
    }
};

module.exports.youtubeSearch = async function (search) {
    const filter = (await ytsr.getFilters(search)).get('Type').get('Video').url;
    const results = filter && (await ytsr(filter, { limit: 10 })).items.filter((v) => v.type === 'video'); // 영상만 가져오기
    // const results = await youtube.searchVideos(search, 10);
    if (!results?.length) {
        return null;
    } else {
        return results;
    }
};
