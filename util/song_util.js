import { Soundcloud } from 'soundcloud.ts';
import { createAudioResource, demuxProbe } from '@discordjs/voice';
import { decodeHTML } from 'entities';
import { request } from 'undici';
import { Constants, Utils } from 'youtubei.js';
import m3u8stream from 'm3u8stream';
import { Readable } from 'node:stream';
import { YoutubeAPI } from '../classes/YoutubeAPI.js';
import { innertube } from './innertube_create.js';
import { Util } from './Util.js';
import { MAX_PLAYLIST_SIZE, GOOGLE_API_KEY, BOT_SERVER_DOMAIN } from '../soyabot_config.js';
const scTrackRegex = /^https?:\/\/soundcloud\.com\/[\w-]+\/[\w-]+\/?/;
const scSetRegex = /^https?:\/\/soundcloud\.com\/[\w-]+\/sets\/[\w-]+\/?/;
const ytVideoRegex = /^[\w-]{11}$/;
const ytListRegex = /^[A-Z]{2}[\w-]{10,}$/;
const ytValidPathDomains = /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/(embed|v|shorts|live)\/)/;
const ytValidQueryDomains = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'];
const soundcloud = new Soundcloud();
const youtube = new YoutubeAPI(GOOGLE_API_KEY);

function getVideoId(urlOrId, checkUrl = false) {
    try {
        if (ytVideoRegex.test(urlOrId) && !checkUrl) {
            return urlOrId;
        }
        const url = new URL(urlOrId);
        let id = url.searchParams.get('v');
        if (ytValidPathDomains.test(urlOrId) && !id) {
            const paths = url.pathname.split('/');
            id = paths[url.hostname === 'youtu.be' ? 1 : 2].slice(0, 11);
        } else if (!ytValidQueryDomains.includes(url.hostname)) {
            return null;
        }
        return ytVideoRegex.test(id ?? '') ? id : null;
    } catch {
        return null;
    }
}

function getListId(urlOrId, checkUrl = false) {
    try {
        if (ytListRegex.test(urlOrId) && !checkUrl) {
            return urlOrId;
        }
        const url = new URL(urlOrId);
        const id = url.searchParams.get('list');
        return ytValidQueryDomains.includes(url.hostname) && ytListRegex.test(id ?? '') ? id : null;
    } catch {
        return null;
    }
}

export function isValidVideo(url) {
    if (scTrackRegex.test(url) || getVideoId(url, true)) {
        return true;
    } else {
        return false;
    }
}

export function isValidPlaylist(url) {
    if (scSetRegex.test(url) || getListId(url, true)) {
        return true;
    } else {
        return false;
    }
}

export async function getSongInfo(urlOrSearch) {
    if (scTrackRegex.test(urlOrSearch)) {
        const { title, permalink_url, duration, artwork_url } = await soundcloud.tracks.get(urlOrSearch);
        return {
            title,
            url: permalink_url,
            duration: Math.ceil(duration / 1000),
            thumbnail: artwork_url?.replace(/-large.(\w+)$/, '-t500x500.$1')
        };
    } else {
        const videoIDs = [
            getVideoId(urlOrSearch, true),
            ...(await innertube.search(urlOrSearch, { type: 'video' })).videos.slice(0, 10).map((v) => v?.id)
        ].flatMap((v) => (v ? v : []));
        if (videoIDs.length == 0) {
            return null;
        }
        for (const id of videoIDs) {
            const info = await innertube.getBasicInfo(id);
            if (info.playability_status.status == 'OK') {
                return {
                    title: info.basic_info.title,
                    url: `https://www.youtube.com/watch?v=${info.basic_info.id}`,
                    duration: info.basic_info.duration,
                    thumbnail: info.basic_info.thumbnail[0].url
                };
            }
        }
        throw new Utils.InnertubeError(`Search query(${urlOrSearch}) is unavailable`);
    }
}

export async function getPlaylistInfo(urlOrSearch) {
    if (scSetRegex.test(urlOrSearch)) {
        const { tracks, title, permalink_url } = await soundcloud.playlists.get(urlOrSearch);
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
        const playlistID =
            getListId(urlOrSearch, true) ??
            (await innertube.search(urlOrSearch, { type: 'playlist' })).playlists[0]?.id;
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

async function createYTStreamYoutubei(url) {
    const info = await innertube.getBasicInfo(getVideoId(url, true));
    if (info.basic_info.is_live) {
        if (info.streaming_data.hls_manifest_url) {
            const { body } = await request(info.streaming_data.hls_manifest_url);
            const streamUrl = (await body.text()).split('\n').find((line) => /^https?:\/\//.test(line));

            return m3u8stream(streamUrl, {
                chunkReadahead: info.basic_info.live_chunk_readahead,
                begin: Date.now(),
                liveBuffer: 2000,
                requestOptions: { headers: Constants.STREAM_HEADERS },
                parser: 'm3u8'
            });
        } else {
            throw new Utils.InnertubeError('No matching formats found');
        }
    } else {
        const formats = [...(info.streaming_data?.formats ?? []), ...(info.streaming_data?.adaptive_formats ?? [])];
        const hasOpus = formats.some((v) => v.mime_type.includes('opus'));

        return Readable.fromWeb(
            await info.download({ type: 'audio', quality: 'best', format: hasOpus ? 'opus' : 'mp4' })
        );
    }
}

export async function songDownload(url) {
    let source = null;
    if (url.includes('youtube.com')) {
        source = await createYTStreamYoutubei(url);
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

export async function addYoutubeStatistics(url) {
    try {
        const videoID = getVideoId(url, true);
        if (!videoID) {
            return false;
        }
        await request(`http://${BOT_SERVER_DOMAIN}/youtube/add/${videoID}`);
        return true;
    } catch {
        return false;
    }
}

export async function getYoutubeStatisticsCountLimit(count = 50) {
    try {
        const { body } = await request(`http://${BOT_SERVER_DOMAIN}/youtube/result/count/${count}`);
        return await body.json();
    } catch {
        return [];
    }
}

export async function getYoutubeStatisticsDateRange(start, end) {
    try {
        const { body } = await request(`http://${BOT_SERVER_DOMAIN}/youtube/result/date/${start}/${end}`);
        return await body.json();
    } catch {
        return [];
    }
}
