import { Client, Intents, Options } from 'discord.js';
import { SQLiteHandler } from './SQLiteHandler.js';

export class SoyaClient extends Client {
    db; // 봇의 데이터베이스
    commands = []; // 명령어 객체 저장할 배열
    queues = new Map(); // 음악기능 정보 저장용
    cooldowns = new Set(); // 중복 명령 방지용

    constructor(dbPath) {
        super({
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
                guildMembers: {
                    interval: 3600,
                    filter: () => (v) => v.id !== v.client.user.id && !v.voice.channelId
                },
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
        });

        this.db = new SQLiteHandler(dbPath);
    }
}
