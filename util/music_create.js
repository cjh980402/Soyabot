import { fetch } from 'undici';
import { Soundcloud } from 'soundcloud.ts';
import { Innertube, Utils, Log } from 'youtubei.js';
import { BG } from 'bgutils-js';
import { JSDOM } from 'jsdom';
import { setTimeout as sleep } from 'node:timers/promises';
import { exec } from '../admin/admin_function.js';
import { sendAdmin } from '../admin/bot_message.js';

export const innertube = await Innertube.create({
    enable_session_cache: false,
    fetch: async (input, init = undefined) => {
        let response = null;
        let cloneResponse = null;
        for (let i = 0; i < 3; i++) {
            response = await fetch(input, init);
            cloneResponse = response.clone();
            if (cloneResponse.ok) {
                return cloneResponse;
            }
            await sleep(1000);
        }
        throw new Utils.InnertubeError(`The server responded with a ${cloneResponse.status} status code`, {
            error_type: 'FETCH_FAILED',
            cloneResponse
        });
    }
});
export const soundcloud = new Soundcloud();
let refreshTimer = null;

export async function signinInnertube(client) {
    innertube.session.on('auth-pending', (data) => {
        sendAdmin(client.users, `인증 주소: ${data.verification_url}\n인증 코드: ${data.user_code}`);
    });

    innertube.session.on('auth', ({ credentials }) => {
        console.log('Sign in successful:', credentials);
    });

    innertube.session.on('update-credentials', async ({ credentials }) => {
        console.log('Credentials updated:', credentials);
        await innertube.session.oauth.cacheCredentials();
    });

    await innertube.session.signIn();
    delete innertube.session.po_token;
}

export async function refreshInnertube() {
    if (innertube.session.logged_in) {
        return;
    }

    try {
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(refreshInnertube, 7200000);
        const token = await getYoutubePoToken();
        innertube.session.po_token = token.po_token;
        innertube.session.context.client.visitorData = token.visitor_data;
    } catch (err) {
        console.error('유튜브 토큰 재생성 에러 발생:', err);
    }
}

async function getYoutubePoToken() {
    if (process.env.USE_POTOKEN_SCRIPT) {
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
    } else {
        const requestKey = 'O43z0dpjhgX20SCx4KAo';
        const visitorData = innertube.session.context.client.visitorData;
        if (!visitorData) {
            throw new Error('Could not get visitor data');
        }

        const dom = new JSDOM();

        Object.assign(globalThis, {
            window: dom.window,
            document: dom.window.document
        });

        const bgConfig = {
            fetch,
            globalObj: globalThis,
            identifier: visitorData,
            requestKey
        };

        const bgChallenge = await BG.Challenge.create(bgConfig);
        if (!bgChallenge) {
            throw new Error('Could not get challenge');
        }

        const interpreterJavascript = bgChallenge.interpreterJavascript.privateDoNotAccessOrElseSafeScriptWrappedValue;
        if (interpreterJavascript) {
            new Function(interpreterJavascript)();
        } else {
            throw new Error('Could not load VM');
        }

        const poTokenResult = await BG.PoToken.generate({
            program: bgChallenge.program,
            globalName: bgChallenge.globalName,
            bgConfig
        });
        const token = { visitor_data: visitorData, po_token: poTokenResult.poToken };
        console.log(token);

        return token;
    }
}

Log.setLevel(Log.Level.NONE);
