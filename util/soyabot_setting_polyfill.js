import { Message, Util, Channel, CommandInteraction, BaseGuildVoiceChannel, Permissions } from 'discord.js';
import { request } from 'undici';
import { joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';
import { inspect } from 'node:util';

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
