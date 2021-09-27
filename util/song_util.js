import { createAudioResource, demuxProbe } from '@discordjs/voice';
import Soundcloud from 'soundcloud-scraper';
const scdl = new Soundcloud.Client();
import { download as ytdl, search as ytsr } from 'youtube-scrapper';
import { MAX_PLAYLIST_SIZE, GOOGLE_API_KEY } from '../soyabot_config.js';
import YouTubeAPI from 'simple-youtube-api';
const youtube = new YouTubeAPI(GOOGLE_API_KEY);
const videoRegex = /^[\w-]{11}$/;
const listRegex = /^[\w-]{12,}$/;
const validPathDomains = /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/(embed|v|shorts)\/)/;
const validQueryDomains = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'gaming.youtube.com'];

export function isValidVideo(url) {
    if (Soundcloud.Util.validateURL(url, 'track') || getYoutubeVideoID(url)) {
        return true;
    } else {
        return false;
    }
}

export function isValidPlaylist(url) {
    if (Soundcloud.Util.validateURL(url, 'playlist') || getYoutubeListID(url)) {
        return true;
    } else {
        return false;
    }
}

export function getYoutubeVideoID(url) {
    try {
        const parsed = new URL(url);
        let id = parsed.searchParams.get('v');
        if (validPathDomains.test(url) && !id) {
            const paths = parsed.pathname.split('/');
            id = paths[parsed.hostname === 'youtu.be' ? 1 : 2].substring(0, 11);
        } else if (!validQueryDomains.includes(parsed.hostname)) {
            return null;
        }
        return videoRegex.test(id ?? '') ? id : null;
    } catch {
        return null;
    }
}

export function getYoutubeListID(url) {
    try {
        const parsed = new URL(url);
        const id = parsed.searchParams.get('list');
        return validQueryDomains.includes(parsed.hostname) && listRegex.test(id ?? '') ? id : null;
    } catch {
        return null;
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
        const videoID = getYoutubeVideoID(url) ?? (await ytsr(search, 'video')).videos[0]?.id;
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
        const playlistID = getYoutubeListID(url) ?? (await ytsr(search, 'playlist')).playlists[0]?.id;
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
        source = await ytdl(url, null, { chunkMode: true });
    } else if (url.includes('soundcloud.com')) {
        source = await (await scdl.getSongInfo(url)).downloadProgressive();
    } else {
        throw new Error('지원하지 않는 영상 주소입니다.');
    }
    const { stream, type } = await demuxProbe(source);
    return createAudioResource(stream, {
        inputType: type
        // inlineVolume: true
    });
}

export async function youtubeSearch(search, limit = 10) {
    const results = (await ytsr(search, 'video')).videos.slice(0, limit);
    // const results = await youtube.searchVideos(search, limit);
    if (!results.length) {
        return null;
    } else {
        return results;
    }
}
