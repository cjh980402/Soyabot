import { Client, IntentsBitField, Options, Partials, ActivityType } from 'discord.js';
import { SQLiteHandler } from './SQLiteHandler.js';
import { MapleProb } from '../util/maple_probtable.js';
export const liveValue = new Map(); // 실시간 기능 변경용

export class SoyaClient extends Client {
    db; // 봇의 데이터베이스
    commands = new Map(); // 명령어 객체 저장용
    queues = new Map(); // 음악기능 정보 저장용
    cooldowns = new Set(); // 중복 명령 방지용
    liveValue = liveValue;

    constructor(dbPath) {
        super({
            retryLimit: 3,
            failIfNotExists: false,
            partials: [Partials.Channel],
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildVoiceStates,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.DirectMessages
            ],
            presence: { activities: [{ name: '/help 및 /건의', type: ActivityType.Listening }] },
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

    async start() {
        this.db.run(
            'CREATE TABLE IF NOT EXISTS maple_notice(id integer primary key autoincrement, title text, url text, notice_number integer)'
        );
        this.db.run('CREATE INDEX IF NOT EXISTS notice_index ON maple_notice(title, notice_number)');
        this.db.run(
            'CREATE TABLE IF NOT EXISTS maple_update(id integer primary key autoincrement, title text, url text, notice_number integer)'
        );
        this.db.run('CREATE INDEX IF NOT EXISTS update_index ON maple_update(title, notice_number)');
        this.db.run(
            'CREATE TABLE IF NOT EXISTS maple_test(id integer primary key autoincrement, title text, url text, notice_number integer)'
        );
        this.db.run('CREATE INDEX IF NOT EXISTS test_index ON maple_test(title, notice_number)');
        this.db.run(
            'CREATE TABLE IF NOT EXISTS test_patch(id integer primary key autoincrement, version integer, url text)'
        );
        this.db.run(
            'CREATE TABLE IF NOT EXISTS pruning_skip(id integer primary key autoincrement, guild_id text, name text)'
        );
        this.db.run(
            'CREATE TABLE IF NOT EXISTS command_db(id integer primary key autoincrement, name text, count integer)'
        );

        await MapleProb.fetchAllProb();
        await this.login();
    }

    async createCommand() {
        if (this.application.partial) {
            await this.application.fetch();
        }

        await this.application.commands.set([...this.commands.values()].map((cmd) => cmd.commandData));
    }
}
