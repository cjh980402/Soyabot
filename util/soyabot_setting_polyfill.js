import {
    Message,
    Util,
    Intents,
    Options,
    VoiceState,
    Channel,
    CommandInteraction,
    BaseGuildVoiceChannel,
    Permissions
} from 'discord.js';
import { request } from 'undici';
import YouTubeAPI from 'simple-youtube-api';
import { PARTS, ENDPOINTS } from 'simple-youtube-api/src/util/Constants.js';
import Video from 'simple-youtube-api/src/structures/Video.js';
import { joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';
import { inspect } from 'node:util';
const { _patch } = Message.prototype;

function contentSplitCode(content, options) {
    content ||= '\u200b';
    if (options.code) {
        content = `\`\`\`${options.code}\n${Util.cleanCodeBlockContent(content)}\n\`\`\``;
        if (options.split) {
            options.split.prepend = `${options.split.prepend ?? ''}\`\`\`${options.code}\n`;
            options.split.append = `\n\`\`\`${options.split.append ?? ''}`;
        }
    }
    if (options.split) {
        content = Util.splitMessage(content, options.split);
    } else {
        content = [content];
    }
    return content;
}

function entersState(target, status, timeout) {
    return new Promise((resolve, reject) => {
        if (target.state.status === status) {
            return resolve(target);
        }

        let failTimer = null;
        const onStatus = () => {
            clearTimeout(failTimer);
            resolve(target);
        };

        failTimer = setTimeout(() => {
            target.off(status, onStatus);
            reject(new Error(`Didn't enter state ${status} within ${timeout}ms`));
        }, timeout);

        target.once(status, onStatus);
    });
}

Object.defineProperty(Options, 'createCustom', {
    value() {
        return {
            retryLimit: 3,
            failIfNotExists: false,
            partials: ['CHANNEL'],
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_VOICE_STATES,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.DIRECT_MESSAGES
            ],
            presence: { activities: [{ name: '/help', type: 'LISTENING' }] },
            sweepers: {
                voiceStates: {
                    interval: 3600,
                    filter: () => (v) => v.id !== v.client.user.id && !v.channelId
                }
            },
            makeCache: Options.cacheWithLimits({
                ApplicationCommandManager: 0,
                BaseGuildEmojiManager: 0,
                GuildEmojiManager: 0,
                ChannelManager: {
                    maxSize: 1,
                    keepOverLimit: (v) => v.isText() || v.isVoice()
                },
                GuildChannelManager: {
                    maxSize: 1,
                    keepOverLimit: (v) => v.isText() || v.isVoice()
                },
                GuildMemberManager: {
                    maxSize: 1,
                    keepOverLimit: (v) => v.id === v.client.user.id
                },
                GuildBanManager: 0,
                GuildInviteManager: 0,
                GuildScheduledEventManager: 0,
                GuildStickerManager: 0,
                MessageManager: 0,
                PresenceManager: 0,
                ReactionManager: 0,
                ReactionUserManager: 0,
                StageInstanceManager: 0,
                ThreadManager: 0,
                ThreadMemberManager: 0,
                UserManager: 0
            })
        };
    }
});

Object.defineProperty(Message.prototype, '_patch', {
    value(data) {
        _patch.call(this, data);
        if (data.member && this.guild && this.author) {
            this._member = this.guild.members._add({ ...data.member, user: this.author }, false); // 임시 멤버 객체 할당
        }
    }
});

Object.defineProperty(Message.prototype, 'member', {
    get() {
        return this.guild?.members.resolve(this.author) ?? this._member ?? null; // 할당된 임시 멤버 객체 반환
    }
});

Object.defineProperty(VoiceState.prototype, 'member', {
    get() {
        return this.guild.members.resolve(this.id) ?? this.guild.members._add({ user: { id: this.id } }, false); // 임시 멤버 객체 생성 후 반환
    }
});

Object.defineProperty(Message.prototype, 'fetchFullContent', {
    async value() {
        if (this.type === 'DEFAULT' && this.attachments.first()?.name === 'message.txt') {
            const { body } = await request(this.attachments.first().url);
            return body.text();
        } else {
            return this.content;
        }
    }
});

Object.defineProperty(Channel.prototype, 'sendSplitCode', {
    async value(content, options = {}) {
        if (this.isText()) {
            for (const c of contentSplitCode(content, options)) {
                await this.send(c);
            }
        }
    }
});

Object.defineProperty(CommandInteraction.prototype, 'sendSplitCode', {
    async value(content, options = {}) {
        for (const c of contentSplitCode(content, options)) {
            await this.followUp(c);
        }
    }
});

Object.defineProperty(BaseGuildVoiceChannel.prototype, 'join', {
    async value() {
        const connection = joinVoiceChannel({
            channelId: this.id,
            guildId: this.guildId,
            adapterCreator: this.guild.voiceAdapterCreator
        });

        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 30000); // 연결될 때까지 최대 30초 대기
            if (
                this.type === 'GUILD_STAGE_VOICE' &&
                this.permissionsFor(this.guild.me).has(Permissions.STAGE_MODERATOR)
            ) {
                await this.guild.me.voice.setSuppressed(false); // 스테이지 채널이면서 관리 권한이 있으면 봇을 speaker로 설정
            }
            return connection;
        } catch (err) {
            connection.destroy(); // 에러 발생 시 연결 취소
            throw err;
        }
    }
});

Object.defineProperty(YouTubeAPI.prototype, 'getVideosByIDs', {
    async value(ids, options = {}) {
        const result = await this.request.make(ENDPOINTS.Videos, { ...options, part: PARTS.Videos, id: ids.join(',') });
        if (result.items.length > 0) {
            return result.items.map((v) => (v ? new Video(this, v) : null));
        } else {
            throw new Error(`resource ${result.kind} not found`);
        }
    }
});

Object.defineProperty(Array.prototype, 'asyncFilter', {
    // async 함수를 사용 가능한 Array의 filter 메소드 구현
    async value(callback) {
        const fail = Symbol();
        return (await Promise.all(this.map(async (v) => ((await callback(v)) ? v : fail)))).filter((v) => v !== fail);
    }
});

Object.defineProperty(Array.prototype, 'deduplication', {
    // 중복된 배열의 원소를 제거한 배열을 반환
    value() {
        return [...new Set(this)];
    }
});

Object.defineProperty(Array.prototype, 'shuffle', {
    value(indexStart = 0, indexEnd = this.length) {
        for (let i = indexEnd - 1; i > indexStart; i--) {
            const j = Math.floor(Math.random() * (i - indexStart + 1)) + indexStart;
            [this[i], this[j]] = [this[j], this[i]];
        }
        return this; // 메소드 체이닝을 위한 배열 반환
    }
});

Object.defineProperty(Number.prototype, 'toUnitString', {
    value(count = 5) {
        // count는 출력할 단위의 개수
        const unitName = ['경', '조', '억', '만', ''];
        const unitStd = 10000;
        const rslt = [];
        let unitNum = unitStd ** (unitName.length - 1);
        let num = Math.abs(this);

        for (const unit of unitName) {
            const quotient = Math.floor(num / unitNum);
            if (quotient > 0 && rslt.length < count) {
                rslt.push(`${quotient}${unit}`);
            }
            num %= unitNum;
            unitNum /= unitStd;
        }
        return `${this < 0 ? '- ' : ''}${rslt.join(' ') || '0'}`;
    }
});

Object.defineProperty(Number.prototype, 'toDurationString', {
    value() {
        const hours = Math.floor(this / 3600);
        const minutes = Math.floor((this % 3600) / 60);
        const seconds = Math.floor(this % 60);

        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        } else {
            return `${minutes}:${String(seconds).padStart(2, '0')}`;
        }
    }
});

Object.defineProperty(String.prototype, 'hashCode', {
    value() {
        let h = 0;
        for (const c of this) {
            h = (31 * h + c.codePointAt(0)) | 0; // 연산 후 signed 32-bit 정수로 변환
        }
        return h;
    }
});

Object.defineProperty(Object.prototype, '_i', {
    // util.inspect의 결과 출력
    value(depth = 2) {
        return inspect(this, { depth });
    }
});

Object.defineProperty(Object.prototype, '_p', {
    // 객체의 키와 값 출력
    get() {
        return Object.getOwnPropertyNames(this)
            .map((v) => {
                try {
                    return `${v}: ${this[v]}`;
                } catch (err) {
                    return `${v}: '${err}'`;
                }
            })
            .join('\n');
    }
});

Object.defineProperty(Object.prototype, '_k', {
    // 객체의 키만 출력
    get() {
        return Object.getOwnPropertyNames(this).join('\n');
    }
});

Object.defineProperty(Object.prototype, '__p', {
    // 객체의 프로토타입의 키와 값 출력
    get() {
        return Object.getPrototypeOf(this)._p;
    }
});

Object.defineProperty(Object.prototype, '__k', {
    // 객체의 프로토타입의 키만 출력
    get() {
        return Object.getPrototypeOf(this)._k;
    }
});
