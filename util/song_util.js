import SoundcloudAPI from 'soundcloud.ts';
import { createAudioResource, demuxProbe } from '@discordjs/voice';
import { decodeHTML } from 'entities';
import { download as ytdl, search as ytsr, Util as YtUtil } from 'youtube-dlsr';
import { YoutubeAPI } from '../classes/YoutubeAPI.js';
import { Util } from '../util/Util.js';
import { MAX_PLAYLIST_SIZE, GOOGLE_API_KEY } from '../soyabot_config.js';
const scTrackRegex = /^https?:\/\/soundcloud\.com\/[\w-]+\/[\w-]+\/?$/;
const scSetRegex = /^https?:\/\/soundcloud\.com\/[\w-]+\/sets\/[\w-]+\/?$/;
const soundcloud = new SoundcloudAPI.default();
const youtube = new YoutubeAPI(GOOGLE_API_KEY);

export function isValidVideo(url) {
    if (scTrackRegex.test(url) || YtUtil.getVideoId(url, true)) {
        return true;
    } else {
        return false;
    }
}

export function isValidPlaylist(url) {
    if (scSetRegex.test(url) || YtUtil.getListId(url, true)) {
        return true;
    } else {
        return false;
    }
}

export async function getSongInfo(url, search) {
    if (scTrackRegex.test(url)) {
        const { title, permalink_url, duration, artwork_url } = await soundcloud.tracks.getV2(url);
        return {
            title,
            url: permalink_url,
            duration: Math.ceil(duration / 1000),
            thumbnail: artwork_url?.replace(/-large.(\w+)$/, '-t500x500.$1')
        };
    } else {
        const videoID = YtUtil.getVideoId(url, true) ?? (await ytsr(search, { type: 'video', limit: 1 }))[0]?.id;
        if (!videoID) {
            return null;
        }
        const { title, url: songURL, durationSeconds, maxRes } = await youtube.getVideoByID(videoID);
        return {
            title: decodeHTML(title),
            url: songURL,
            duration: durationSeconds,
            thumbnail: maxRes.url
        };
    }
}

export async function getPlaylistInfo(url, search) {
    if (scSetRegex.test(url)) {
        const { tracks, title, permalink_url } = await soundcloud.playlists.getV2(url);
        const songs = Util.shuffle(
            tracks.filter((track) => track.sharing === 'public') // 비공개 또는 삭제된 영상 제외하기
        )
            .slice(0, MAX_PLAYLIST_SIZE)
            .map((track) => ({
                title: track.title,
                url: track.permalink_url,
                duration: Math.ceil(track.duration / 1000),
                thumbnail: track.artwork_url?.replace(/-large.(\w+)$/, '-t500x500.$1')
            }));
        return { title, url: permalink_url, songs };
    } else {
        const playlistID = YtUtil.getListId(url, true) ?? (await ytsr(search, { type: 'playlist', limit: 1 }))[0]?.id;
        if (!playlistID) {
            return null;
        }
        const playlist = await youtube.getPlaylistByID(playlistID);
        const videoIds = Util.shuffle(
            (await playlist.getVideos(200)).filter((video) => video.raw.status.privacyStatus === 'public') // 비공개 또는 삭제된 영상 제외하기
        )
            .slice(0, MAX_PLAYLIST_SIZE)
            .map((video) => video.id);
        const songs = (await youtube.getVideosByIDs(videoIds)).map((video) => ({
            title: decodeHTML(video.title),
            url: video.url,
            duration: video.durationSeconds,
            thumbnail: video.maxRes.url
        }));
        return { title: decodeHTML(playlist.title), url: playlist.url, songs };
    }
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
    });
}
