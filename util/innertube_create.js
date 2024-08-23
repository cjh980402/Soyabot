import { fetch } from 'undici';
import { Innertube, Utils, Log } from 'youtubei.js';
import { setTimeout } from 'node:timers/promises';
import { exec } from '../admin/admin_function.js';

export let innertube = await createInnertube();

export async function refreshInnertube() {
    try {
        innertube = await createInnertube();
    } catch (err) {
        console.error('유튜브 모듈 재생성 에러 발생:', err);
    }
}

async function getYoutubePoToken() {
    const { stdout: data } = await exec('python3 ./util/python/youtube-trusted-session-generator.py', {
        encoding: 'utf-8'
    }); // 파이썬 스크립트 실행
    const parse = /visitor_data: (.+?)\npo_token: (.+?)\n/.exec(data);
    const token = {
        visitor_data: parse?.[1] ?? '',
        po_token: parse?.[2] ?? ''
    };
    console.log(token);

    return token;
}

async function createInnertube() {
    return await Innertube.create({
        ...(await getYoutubePoToken()),
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
}

Log.setLevel(Log.Level.NONE);
setInterval(refreshInnertube, 7200000); // 2시간 후에 재실행
