import SoundcloudAPI from 'soundcloud.ts';
import { createAudioResource, demuxProbe } from '@discordjs/voice';
import { decodeHTML } from 'entities';
import { request, fetch } from 'undici';
import { Innertube, Constants, Utils } from 'youtubei.js';
import ytdl from '@distube/ytdl-core';
import m3u8stream from 'm3u8stream';
import { PassThrough, Readable } from 'node:stream';
import { setTimeout } from 'node:timers/promises';
import { YoutubeAPI } from '../classes/YoutubeAPI.js';
import { liveValue } from '../classes/SoyaClient.js';
import { Util } from '../util/Util.js';
import { MAX_PLAYLIST_SIZE, GOOGLE_API_KEY, BOT_SERVER_DOMAIN } from '../soyabot_config.js';
const scTrackRegex = /^https?:\/\/soundcloud\.com\/[\w-]+\/[\w-]+\/?$/;
const scSetRegex = /^https?:\/\/soundcloud\.com\/[\w-]+\/sets\/[\w-]+\/?$/;
const ytVideoRegex = /^[\w-]{11}$/;
const ytListRegex = /^[A-Z]{2}[\w-]{10,}$/;
const ytValidPathDomains = /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/(embed|v|shorts|live)\/)/;
const ytValidQueryDomains = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'];
const soundcloud = new SoundcloudAPI.default();
const youtube = new YoutubeAPI(GOOGLE_API_KEY);
export const innertube = await Innertube.create({
    visitor_data: '',
    po_token: '',
    enable_session_cache: false,
    fetch: async (input, init = undefined) => {
        let response = null;
        for (let i = 0; i < 3; i++) {
            response = await fetch(input, init);
            if (response.ok) {
                return response;
            }
            await setTimeout(1000);
        }
        throw new Utils.InnertubeError(`The server responded with a ${response.status} status code`, {
            error_type: 'FETCH_FAILED',
            response
        });
    }
});

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
        const videoIDs = [
            getVideoId(url, true),
            ...(await innertube.search(search, { type: 'video' })).videos.slice(0, 10).map((v) => v.id)
        ];
        for (const id of videoIDs) {
            if (id) {
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
        }
        return null;
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
        const playlistID =
            getListId(url, true) ?? (await innertube.search(search, { type: 'playlist' })).playlists[0]?.id;
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

async function createYTStreamYtdl(url) {
    const info = await ytdl.getInfo(url);
    if (!info.formats.length) {
        throw new Error('This video is unavailable');
    }

    const hasOpus = info.formats.some((v) => v.mimeType.includes('opus'));
    const options = {
        filter: (v) => (hasOpus ? v.mimeType.includes('opus') : v.hasAudio),
        liveBuffer: 2000,
        highWaterMark: 1 << 25,
        dlChunkSize: 0,
        requestOptions: {
            headers: {
                origin: 'https://www.youtube.com',
                referer: 'https://www.youtube.com/'
            }
        }
    };
    const format = ytdl.chooseFormat(info.formats, options);
    const contentLength = Number(format.contentLength);
    const chunkSize = 1 << 19;

    if (contentLength < chunkSize || format.isHLS || format.isDashMPD) {
        return ytdl.downloadFromInfo(info, options);
    } else {
        let current = 0;
        const stream = new PassThrough();
        const pipeNextStream = () => {
            let end = chunkSize * (current + 1) - 1;
            if (end >= contentLength) {
                end = undefined;
            }
            const nextStream = ytdl.downloadFromInfo(info, {
                ...options,
                range: {
                    start: chunkSize * current,
                    end
                }
            });
            ['abort', 'request', 'response', 'error', 'redirect', 'retry', 'reconnect'].forEach((event) => {
                nextStream.prependListener(event, stream.emit.bind(stream, event));
            });
            nextStream.pipe(stream, { end: end === undefined });
            if (end !== undefined) {
                nextStream.on('end', () => {
                    current++;
                    pipeNextStream();
                });
            }
        };
        pipeNextStream();
        return stream;
    }
}

export async function songDownload(url) {
    let source = null;
    if (url.includes('youtube.com')) {
        source = await (liveValue.get('youtubeModule') ? createYTStreamYtdl(url) : createYTStreamYoutubei(url));
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
