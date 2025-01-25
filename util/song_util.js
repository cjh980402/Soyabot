import { createAudioResource, demuxProbe } from '@discordjs/voice';
import { request } from 'undici';
import { Constants, Utils } from 'youtubei.js';
import GoogleVideo from 'googlevideo';
import m3u8stream from 'm3u8stream';
import { PassThrough } from 'node:stream';
import { innertube, soundcloud, refreshInnertube } from './music_create.js';
import { Util } from './Util.js';
import { MAX_PLAYLIST_SIZE, BOT_SERVER_DOMAIN } from '../soyabot_config.js';
const scTrackRegex = /^https?:\/\/soundcloud\.com\/[\w-]+\/(?!sets\/)[\w-]+\/?/;
const scSetRegex = /^https?:\/\/soundcloud\.com\/[\w-]+\/sets\/[\w-]+\/?/;
const ytVideoRegex = /^[\w-]{11}$/;
const ytListRegex = /^[A-Z]{2}[\w-]{10,}$/;
const ytValidPathDomains = /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/(embed|v|shorts|live)\/)/;
const ytValidQueryDomains = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'];

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
        if (ytValidQueryDomains.includes(url.hostname) && ytListRegex.test(id ?? '')) {
            if (id.startsWith('RD')) {
                return url.searchParams.get('v') ? id : null;
            } else {
                return id;
            }
        } else {
            return null;
        }
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
        const track = await soundcloud.tracks.get(urlOrSearch);
        if (track.media?.transcodings.length === 0) {
            return null;
        }
        return {
            title: track.title,
            url: track.permalink_url,
            duration: Math.ceil(track.duration / 1000),
            thumbnail: (track.artwork_url ?? track.user?.avatar_url)?.replace(/-large.(\w+)$/, '-t500x500.$1')
        };
    } else {
        if (process.env.USE_YOUTUBE) {
            if (!innertube.session.po_token) {
                await refreshInnertube();
            }

            const videoID = getVideoId(urlOrSearch, true);
            if (videoID) {
                const info = await innertube.getBasicInfo(videoID, 'WEB_EMBEDDED');
                if (info.playability_status?.status == 'OK' && info.playability_status?.embeddable) {
                    return {
                        title: info.basic_info.title,
                        url: `https://www.youtube.com/watch?v=${info.basic_info.id}`,
                        duration: info.basic_info.duration,
                        thumbnail: info.basic_info.thumbnail[0].url
                    };
                }
                if (info.basic_info.title) {
                    urlOrSearch = info.basic_info.title;
                } else {
                    throw new Utils.InnertubeError(`URL(${urlOrSearch}) is unavailable`);
                }
            }

            const videoIDs = (await innertube.search(urlOrSearch, { type: 'video' })).videos
                .slice(0, 10)
                .map((v) => v?.id);
            if (videoIDs.length == 0) {
                return null;
            }
            for (const id of videoIDs) {
                const info = await innertube.getBasicInfo(id, 'WEB_EMBEDDED');
                if (info.playability_status?.status == 'OK' && info.playability_status?.embeddable) {
                    return {
                        title: info.basic_info.title,
                        url: `https://www.youtube.com/watch?v=${info.basic_info.id}`,
                        duration: info.basic_info.duration,
                        thumbnail: info.basic_info.thumbnail[0].url
                    };
                }
            }
            throw new Utils.InnertubeError(`Search query(${urlOrSearch}) is unavailable`);
        } else {
            const track = (await soundcloud.tracks.search({ q: urlOrSearch })).collection[0];
            if (!track?.media?.transcodings.length) {
                return null;
            }
            return {
                title: track.title,
                url: track.permalink_url,
                duration: Math.ceil(track.duration / 1000),
                thumbnail: (track.artwork_url ?? track.user?.avatar_url)?.replace(/-large.(\w+)$/, '-t500x500.$1')
            };
        }
    }
}

export async function getPlaylistInfo(urlOrSearch) {
    if (scSetRegex.test(urlOrSearch)) {
        const { tracks, title, permalink_url } = await soundcloud.playlists.get(urlOrSearch);
        const songs = Util.shuffle(
            tracks.filter((track) => track.sharing === 'public' && track.media?.transcodings.length)
        ) // 재생 불가능한 영상 제외하기
            .slice(0, MAX_PLAYLIST_SIZE)
            .map((track) => ({
                title: track.title,
                url: track.permalink_url,
                duration: Math.ceil(track.duration / 1000),
                thumbnail: (track.artwork_url ?? track.user?.avatar_url)?.replace(/-large\.(\w+)$/, '-t500x500.$1')
            }));
        if (songs.length === 0) {
            return null;
        }
        return { title, url: permalink_url, songs };
    } else {
        if (process.env.USE_YOUTUBE) {
            const urlListID = getListId(urlOrSearch, true);
            const playlistID =
                urlListID ?? (await innertube.search(urlOrSearch, { type: 'playlist' })).playlists[0]?.id;
            if (!playlistID) {
                return null;
            }
            if (urlListID?.startsWith('RD')) {
                const { playlist } = await innertube.getInfo(await innertube.resolveURL(urlOrSearch), 'WEB_EMBEDDED');
                const songs = Util.shuffle(playlist.contents)
                    .slice(0, MAX_PLAYLIST_SIZE)
                    .map((video) => ({
                        title: video.title.toString(),
                        url: `https://www.youtube.com/watch?v=${video.video_id}`,
                        duration: video.duration.seconds || 0,
                        thumbnail: video.thumbnail[0].url.replace(/(\w+\.\w+)\?.+$/, '$1')
                    }));
                if (songs.length === 0) {
                    return null;
                }
                return { title: playlist.title, url: urlOrSearch, songs };
            } else {
                const playlist = await innertube.getPlaylist(playlistID);
                const songs = Util.shuffle(playlist.items.filter((video) => video.is_playable)) // 재생 불가능한 영상 제외하기
                    .slice(0, MAX_PLAYLIST_SIZE)
                    .map((video) => ({
                        title: video.title.toString(),
                        url: `https://www.youtube.com/watch?v=${video.id}`,
                        duration: video.duration.seconds || 0,
                        thumbnail: video.thumbnails[0].url.replace(/(\w+\.\w+)\?.+$/, '$1')
                    }));
                if (songs.length === 0) {
                    return null;
                }
                return {
                    title: playlist.info.title,
                    url: `https://www.youtube.com/playlist?list=${playlistID}`,
                    songs
                };
            }
        } else {
            const playlists = await soundcloud.playlists.search({ q: urlOrSearch });
            if (playlists.collection.length == 0) {
                return null;
            }
            const { tracks, title, permalink_url } = await soundcloud.playlists.get(playlists.collection[0].id);
            const songs = Util.shuffle(
                tracks.filter((track) => track.sharing === 'public' && track.media?.transcodings.length)
            ) // 재생 불가능한 영상 제외하기
                .slice(0, MAX_PLAYLIST_SIZE)
                .map((track) => ({
                    title: track.title,
                    url: track.permalink_url,
                    duration: Math.ceil(track.duration / 1000),
                    thumbnail: (track.artwork_url ?? track.user?.avatar_url)?.replace(/-large\.(\w+)$/, '-t500x500.$1')
                }));
            if (songs.length === 0) {
                return null;
            }
            return { title, url: permalink_url, songs };
        }
    }
}

async function createYTStream(url) {
    if (!innertube.session.po_token) {
        await refreshInnertube();
    }

    const info = await innertube.getBasicInfo(getVideoId(url, true), 'WEB_EMBEDDED');
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
        const durationMs = (info.basic_info?.duration ?? 0) * 1000;
        const audioOutput = new PassThrough();

        const audioFormat = info.chooseFormat({ quality: 'best', format: 'webm', type: 'audio' });
        const videoFormat = info.chooseFormat({ quality: '720p', format: 'webm', type: 'video' });

        const selectedAudioFormat = {
            itag: audioFormat.itag,
            lastModified: audioFormat.last_modified_ms,
            xtags: audioFormat.xtags
        };

        const selectedVideoFormat = {
            itag: videoFormat.itag,
            lastModified: videoFormat.last_modified_ms,
            width: videoFormat.width,
            height: videoFormat.height,
            xtags: videoFormat.xtags
        };

        const serverAbrStreamingUrl = innertube.session.player?.decipher(
            info.page[0].streaming_data?.server_abr_streaming_url
        );
        const videoPlaybackUstreamerConfig =
            info.page[0].player_config?.media_common_config.media_ustreamer_request_config
                ?.video_playback_ustreamer_config;

        if (!videoPlaybackUstreamerConfig) {
            throw new Utils.InnertubeError('ustreamerConfig not found');
        }

        if (!serverAbrStreamingUrl) {
            throw new Utils.InnertubeError('serverAbrStreamingUrl not found');
        }

        const serverAbrStream = new GoogleVideo.ServerAbrStream({
            fetch: innertube.session.http.fetch_function,
            poToken: innertube.session.po_token,
            serverAbrStreamingUrl,
            videoPlaybackUstreamerConfig: videoPlaybackUstreamerConfig,
            durationMs
        });

        serverAbrStream.on('data', (streamData) => {
            for (const formatData of streamData.initializedFormats) {
                const isVideo = formatData.mimeType?.includes('video');
                const mediaChunks = formatData.mediaChunks;

                if (!isVideo && mediaChunks.length) {
                    for (const chunk of mediaChunks) {
                        audioOutput.write(chunk);
                    }
                }
            }
        });

        serverAbrStream.on('error', (err) => {
            audioOutput.emit('error', err);
        });

        serverAbrStream.init({
            audioFormats: [selectedAudioFormat],
            videoFormats: [selectedVideoFormat],
            clientAbrState: {
                playerTimeMs: 0,
                enabledTrackTypesBitfield: 0 // 0 = BOTH, 1 = AUDIO (video-only is no longer supported by YouTube)
            }
        });

        return audioOutput;
    }
}

async function createSCStream(url) {
    const streamUrl = await soundcloud.util.streamLink(url, 'progressive');
    if (streamUrl) {
        const stream = new PassThrough();
        try {
            const chunkSize = 512 * 1024;
            const { headers } = await request(streamUrl, { headers: soundcloud.util.api.headers, method: 'HEAD' });
            const contentLength = +headers['content-length'];

            let current = -1;
            const pipeNextStream = async () => {
                current++;
                let end = chunkSize * (current + 1) - 1;
                if (end >= contentLength) {
                    end = undefined;
                }
                try {
                    const { body: nextStream } = await request(streamUrl, {
                        headers: {
                            ...soundcloud.util.api.headers,
                            range: `bytes=${chunkSize * current}-${end ? end : ''}`
                        }
                    });
                    ['abort', 'request', 'response', 'error', 'redirect', 'retry', 'reconnect'].forEach((event) => {
                        nextStream.prependListener(event, stream.emit.bind(stream, event));
                    });
                    nextStream.pipe(stream, { end: end === undefined });
                    if (end !== undefined) {
                        nextStream.on('end', () => {
                            pipeNextStream();
                        });
                    }
                } catch (err) {
                    stream.emit('error', err);
                }
            };
            pipeNextStream();
        } catch (err) {
            stream.emit('error', err);
        }
        return stream;
    } else {
        const { stream } = await soundcloud.util.m3uReadableStream(url);
        return stream;
    }
}

export async function songDownload(url) {
    if (url.includes('youtube.com')) {
        const { stream, type } = await demuxProbe(await createYTStream(url));
        return createAudioResource(stream, {
            metadata: url,
            inputType: type
        });
    } else if (url.includes('soundcloud.com')) {
        return createAudioResource(await createSCStream(url), {
            metadata: url
        });
    } else {
        throw new Error('지원하지 않는 영상 주소입니다.');
    }
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
