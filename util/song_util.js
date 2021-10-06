import { createAudioResource, demuxProbe } from '@discordjs/voice';
import Soundcloud from 'soundcloud-scraper';
import { download as ytdl, search as ytsr, Util } from 'youtube-dlsr';
import { MAX_PLAYLIST_SIZE, GOOGLE_API_KEY } from '../soyabot_config.js';
import YouTubeAPI from 'simple-youtube-api';
const scdl = new Soundcloud.Client();
const youtube = new YouTubeAPI(GOOGLE_API_KEY);

export function isValidVideo(url) {
    if (Soundcloud.Util.validateURL(url, 'track') || Util.getVideoId(url)) {
        return true;
    } else {
        return false;
    }
}

export function isValidPlaylist(url) {
    if (Soundcloud.Util.validateURL(url, 'playlist') || Util.getListId(url)) {
        return true;
    } else {
        return false;
    }
}

export async function getSongInfo(url, search) {
    let songInfo = null,
        song = null;
    if (Soundcloud.Util.validateURL(url, 'track')) {
        songInfo = await scdl.getSongInfo(url);
        song = {
            title: songInfo.title,
            url: songInfo.url,
            duration: Math.ceil(songInfo.duration / 1000),
            thumbnail: songInfo.thumbnail
        };
    } else {
        const videoID = Util.getVideoId(url) ?? (await ytsr(search, { type: 'video', limit: 1 }))[0]?.id;
        // (await youtube.searchVideos(search, 1, { part: 'snippet' }))[0]?.id;
        if (!videoID) {
            return null;
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
}

export async function getPlaylistInfo(url, search) {
    let playlist = null,
        videos = null;
    if (Soundcloud.Util.validateURL(url, 'playlist')) {
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
        const playlistID = Util.getListId(url) ?? (await ytsr(search, { type: 'playlist', limit: 1 }))[0]?.id;
        // (await youtube.searchPlaylists(search, 1, { part: 'snippet' }))[0]?.id;
        if (!playlistID) {
            return null;
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
}

export async function songDownload(url) {
    let source = null;
    if (url.includes('youtube.com')) {
        source = await ytdl(url, { chunkMode: {} });
    } else if (url.includes('soundcloud.com')) {
        source = await (await scdl.getSongInfo(url)).downloadProgressive();
    } else {
        throw new Error('지원하지 않는 영상 주소입니다.');
    }
    const { stream, type } = await demuxProbe(source);
    return createAudioResource(stream, {
        metadata: url,
        inputType: type
        // inlineVolume: true
    });
}

export async function youtubeSearch(search, limit = 10) {
    const results = await ytsr(search, { type: 'video', limit });
    // const results = await youtube.searchVideos(search, limit);
    if (results.length === 0) {
        return null;
    } else {
        return results;
    }
}
