import { ShardingManager } from 'discord.js';
import { TOKEN } from './soyabot_config.js';

const manager = new ShardingManager('./bot.js', { token: TOKEN });

manager.on('shardCreate', (shard) => console.log(`Launched shard ${shard.id}`));

manager.spawn();
