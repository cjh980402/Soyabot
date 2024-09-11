import { fetch } from 'undici';
import { Innertube, Utils, Log } from 'youtubei.js';
import { JSDOM } from 'jsdom';
import { BG } from 'bgutils-js';
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
    /*const { stdout: data } = await exec('python3 ./util/python/youtube-trusted-session-generator.py', {
        encoding: 'utf-8'
    }); // 파이썬 스크립트 실행
    const parse = /visitor_data: (.+?)\npo_token: (.+?)\n/.exec(data);
    const token = {
        visitor_data: parse?.[1] ?? '',
        po_token: parse?.[2] ?? ''
    };*/
    const innertube = await Innertube.create({ retrieve_player: false });
    const requestKey = 'O43z0dpjhgX20SCx4KAo';
    const visitorData = innertube.session.context.client.visitorData;

    const dom = new JSDOM();

    Object.assign(globalThis, {
      window: dom.window,
      document: dom.window.document
    });
    
    const bgConfig = {
      fetch: (url, options) => fetch(url, options),
      globalObj: globalThis,
      identifier: visitorData,
      requestKey,
    };
    
    const challenge = await BG.Challenge.create(bgConfig);
    
    if (!challenge)
      throw new Error('Could not get challenge');
    
    if (challenge.script) {
      const script = challenge.script.find((sc) => sc !== null);
      if (script)
        new Function(script)();
    } else {
      console.warn('Unable to load Botguard.');
    }
    
    const poToken = await BG.PoToken.generate({
      program: challenge.challenge,
      globalName: challenge.globalName,
      bgConfig
    });

    const token = {
        visitor_data: visitorData,
        po_token: poToken
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
