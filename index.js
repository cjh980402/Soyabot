import { ShardingManager } from 'discord.js';
import { TOKEN } from './soyabot_config.js';
const manager = new ShardingManager('./bot.js', { token: TOKEN });

manager.on('shardCreate', (shard) => console.log(`${shard.id}번째 샤드 생성 완료`));

try {
    await manager.spawn({ timeout: 300000 });
} catch (err) {
    console.error('샤드 실행 에러 발생:', err);
}
