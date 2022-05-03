import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ApplicationCommandOptionType } from 'discord.js';

export const type = '기타';
export const commandData = {
    name: '러시안룰렛',
    description: '러시안룰렛 게임을 수행합니다. 탄환 수가 생략된 경우 자동으로 6발이 됩니다.',
    options: [
        {
            name: '탄환_수',
            type: ApplicationCommandOptionType.Integer,
            description: '러시안룰렛 게임의 탄환 수',
            min_value: 2,
            max_value: 20
        }
    ]
};
export async function commandExecute(interaction) {
    if (!interaction.inGuild()) {
        return interaction.followUp('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    } else if (interaction.guild.memberCount < 3) {
        return interaction.followUp(
            `${interaction.client.user.username}을 제외한 방의 인원이 2명 이상일 때 게임을 이용할 수 있습니다.`
        );
    }
    const bullet = interaction.options.getInteger('탄환_수') ?? 6; // 탄환 수 지정
    const gameUser = [interaction.member]; // 참가자 객체 배열
    const startRow = new ActionRowBuilder().addComponents([
        new ButtonBuilder().setCustomId('join').setLabel('참가').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('start').setLabel('시작').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('exit').setLabel('종료').setStyle(ButtonStyle.Danger)
    ]);

    const gameStart = await interaction.followUp({
        content: `게임을 시작하셨습니다.\n참가 버튼을 눌러서 게임 참가가 가능합니다.\n현재 참가자 (1명): ${
            gameUser[0].nickname ?? gameUser[0].user.username
        }`,
        components: [startRow]
    });

    let isStart = false;
    const startCollector = gameStart.createMessageComponentCollector({ time: 300000 });

    startCollector
        .on('collect', async (itr) => {
            try {
                switch (itr.customId) {
                    case 'join':
                        if (gameUser.some((v) => itr.user.id === v.id)) {
                            await itr.reply({ content: '이미 참가하셨습니다.', ephemeral: true });
                        } else {
                            gameUser.push(itr.member); // 참가자 리스트에 추가
                            await itr.update(
                                `게임에 참가하셨습니다.\n현재 참가자 (${gameUser.length}명): ${gameUser
                                    .map((v) => v.nickname ?? v.user.username)
                                    .join(', ')}`
                            );
                            if (gameUser.length === bullet) {
                                isStart = true;
                                await itr.followUp('인원이 가득 차 게임이 자동으로 시작됩니다.');
                                startCollector.stop();
                            }
                        }
                        break;
                    case 'start':
                        if (gameUser.some((v) => itr.user.id === v.id)) {
                            if (gameUser.length > 1) {
                                isStart = true;
                                await itr.reply('러시안룰렛을 시작합니다.');
                                startCollector.stop();
                            } else {
                                await itr.reply({
                                    content: '2명 이상의 참가자가 있어야 시작할 수 있습니다.',
                                    ephemeral: true
                                });
                            }
                        } else {
                            await itr.reply({ content: '게임에 참가한 사람만 시작할 수 있습니다.', ephemeral: true });
                        }
                        break;
                    case 'exit':
                        if (gameUser.some((v) => itr.user.id === v.id)) {
                            await itr.reply('게임을 종료합니다.');
                            startCollector.stop();
                        } else {
                            await itr.reply({ content: '게임에 참여한 사람만 종료할 수 있습니다.', ephemeral: true });
                        }
                        break;
                }
            } catch {}
        })
        .once('end', async () => {
            try {
                startRow.components.forEach((v) => v.setDisabled(true));
                await gameStart.edit({ components: [startRow] });
            } catch {}

            try {
                if (isStart) {
                    // 게임을 진행할 때는 멘션으로 해당하는 사람에게 알려준다.
                    const doingRow = new ActionRowBuilder().addComponents([
                        new ButtonBuilder().setCustomId('gun').setEmoji('🔫').setStyle(ButtonStyle.Danger)
                    ]);

                    const die = Math.floor(Math.random() * bullet); // 0번째 ~ (bullet - 1)번째 탄환 중에서 선택
                    const gameDoing = await interaction.followUp({
                        content: `탄환 ${bullet}발이 장전되었습니다. 첫 시작은 ${gameUser[0]}님입니다.\n🔫 버튼을 눌러서 방아쇠를 당겨주세요.`,
                        components: [doingRow]
                    });

                    let now = 0;
                    const doingCollector = gameDoing.createMessageComponentCollector({
                        filter: (itr) => itr.user.id === gameUser[now % gameUser.length].id,
                        time: 300000
                    });

                    doingCollector
                        .on('collect', async (itr) => {
                            try {
                                if (now === die) {
                                    try {
                                        const dieUser = await itr.guild.members.fetch({
                                            user: gameUser[now % gameUser.length].id,
                                            cache: false
                                        });
                                        await itr.update(`🔫 ${dieUser}님이 사망하셨습니다......\n한 판 더 하실?`);
                                    } catch {
                                        await itr.update('사망한 유저가 방에서 나가서 게임이 자동으로 종료됩니다.');
                                    }
                                    doingCollector.stop();
                                } else {
                                    try {
                                        const nextUser = await itr.guild.members.fetch({
                                            user: gameUser[(now + 1) % gameUser.length].id,
                                            cache: false
                                        });
                                        await itr.update(
                                            `🔫 철컥 (${bullet - (now + 1)}발 남음)\n다음 차례는 ${nextUser}님입니다.`
                                        );
                                    } catch {
                                        await itr.update('다음 차례 유저가 방에서 나가서 게임이 자동으로 종료됩니다.');
                                        doingCollector.stop();
                                    }
                                }
                                now++;
                            } catch {}
                        })
                        .once('end', async () => {
                            try {
                                doingRow.components[0].setDisabled(true);
                                await gameDoing.edit({ components: [doingRow] });
                            } catch {}
                        });
                }
            } catch {}
        });
}
