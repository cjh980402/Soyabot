const { Client, Util } = require('soundcloud-scraper');
const scdl = new Client();
const ytdl = require('ytdl-core');
const { MAX_PLAYLIST_SIZE, GOOGLE_API_KEY } = require('../soyabot_config.json');
const YouTubeAPI = require('simple-youtube-api');
const youtube = new YouTubeAPI(GOOGLE_API_KEY);
const ytsr = require('ytsr');
const listRegex = /^[\w-]+$/;
const validQueryDomains = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'gaming.youtube.com'];

module.exports.isValidVideo = function (url) {
    if (Util.validateURL(url, 'track') || ytdl.validateURL(url)) {
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
        return ytdl.getVideoID(url);
    } catch {
        return null;
    }
};

module.exports.getYoutubeListID = function (url) {
    try {
        const parsed = new URL(url);
        const id = parsed.searchParams.get('list');
        if (validQueryDomains.includes(parsed.hostname) && listRegex.test(id ?? '')) {
            return id;
        } else {
            return null;
        }
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
                duration: Math.ceil(songInfo.duration / 1000)
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
                duration: songInfo.durationSeconds
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
            videos = playlist.tracks.slice(0, MAX_PLAYLIST_SIZE).map((track) => ({
                title: track.title,
                url: track.url,
                duration: Math.ceil(track.duration / 1000)
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
            videos = (await playlist.getVideos(MAX_PLAYLIST_SIZE, { part: 'snippet' }))
                .filter((video) => !/(Private|Deleted) video/.test(video.title)) // 비공개 또는 삭제된 영상 제외하기
                .map((video) => video.id);
            videos = (await youtube.getVideosByIDs(videos)).map((video) => ({
                title: video.title.decodeHTML(),
                url: video.url,
                duration: video.durationSeconds
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
    if (url.includes('youtube.com')) {
        return ytdl(url, { filter: 'audio', quality: 'highestaudio' });
    } else if (url.includes('soundcloud.com')) {
        return (await scdl.getSongInfo(url)).downloadProgressive();
    } else {
        throw new Error('This url is unavailable');
    }
};