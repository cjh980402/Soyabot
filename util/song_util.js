import SoundcloudAPI from 'soundcloud.ts';
import YouTubeAPI from 'simple-youtube-api';
import { createAudioResource, demuxProbe } from '@discordjs/voice';
import { download as ytdl, search as ytsr, Util } from 'youtube-dlsr';
import { MAX_PLAYLIST_SIZE, GOOGLE_API_KEY } from '../soyabot_config.js';
const scTrackRegex = /^https?:\/\/soundcloud\.com\/[\w-]+\/[\w-]+\/?$/;
const scSetRegex = /^https?:\/\/soundcloud\.com\/[\w-]+\/sets\/[\w-]+\/?$/;
const soundcloud = new SoundcloudAPI.default();
const youtube = new YouTubeAPI(GOOGLE_API_KEY);

export function isValidVideo(url) {
    if (scTrackRegex.test(url) || Util.getVideoId(url, true)) {
        return true;
    } else {
        return false;
    }
}

export function isValidPlaylist(url) {
    if (scSetRegex.test(url) || Util.getListId(url, true)) {
        return true;
    } else {
        return false;
    }
}

export async function getSongInfo(url, search) {
    let songInfo = null,
        song = null;
    if (scTrackRegex.test(url)) {
        songInfo = await soundcloud.tracks.getV2(url);
        song = {
            title: songInfo.title,
            url: songInfo.permalink_url,
            duration: Math.ceil(songInfo.duration / 1000),
            thumbnail: songInfo.artwork_url?.replace(/-large.(\w+)$/, '-t500x500.$1')
        };
    } else {
        const videoID = Util.getVideoId(url, true) ?? (await ytsr(search, { type: 'video', limit: 1 }))[0]?.id;
        // (await youtube.searchVideos(search, 1))[0]?.id;
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
    if (scSetRegex.test(url)) {
        playlist = await soundcloud.playlists.getV2(url);
        videos = playlist.tracks
            .filter((track) => track.sharing === 'public') // 비공개 또는 삭제된 영상 제외하기
            .shuffle()
            .slice(0, MAX_PLAYLIST_SIZE)
            .map((track) => ({
                title: track.title,
                url: track.permalink_url,
                duration: Math.ceil(track.duration / 1000),
                thumbnail: track.artwork_url?.replace(/-large.(\w+)$/, '-t500x500.$1')
            }));
    } else {
        const playlistID = Util.getListId(url, true) ?? (await ytsr(search, { type: 'playlist', limit: 1 }))[0]?.id;
        // (await youtube.searchPlaylists(search, 1))[0]?.id;
        if (!playlistID) {
            return null;
        }
        playlist = await youtube.getPlaylistByID(playlistID);
        videos = (await playlist.getVideos(200))
            .filter((video) => video.raw.status.privacyStatus === 'public') // 비공개 또는 삭제된 영상 제외하기
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
    return { songs: videos, title: playlist.title, url: playlist.url ?? playlist.permalink_url };
}

export async function songDownload(url) {
    let source = null;
    if (url.includes('youtube.com')) {
        source = await ytdl(url);
    } else if (url.includes('soundcloud.com')) {
        source = await soundcloud.util.streamTrack(url);
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
