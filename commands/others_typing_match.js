import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ApplicationCommandOptionType
} from 'discord.js';
import Hangul from 'hangul-js';
import { setTimeout } from 'node:timers/promises';
import { matchString } from '../util/Constant.js';

export const type = '기타';
export const commandData = {
    name: '타자대결',
    description: '임의의 문장을 빨리 치는 사람이 승리하는 타자 대결을 수행합니다.',
    options: [
        {
            name: '옵션',
            type: ApplicationCommandOptionType.String,
            description: '한을 입력 시 한글, 영을 입력 시 영어, 생략 시 랜덤으로 나옵니다.',
            choices: ['한', '영'].map((v) => ({ name: v, value: v }))
        }
    ]
};
export async function commandExecute(interaction) {
    const option = interaction.options.getString('옵션');
    const [min, max] =
        option === '한' ? [0, 1119] : option === '영' ? [1120, matchString.length - 1] : [0, matchString.length - 1];
    const random = Math.floor(Math.random() * (max - min + 1)) + min; // 랜덤 선택된 문장의 인덱스
    const choice = matchString[random];
    const choiceLength = Hangul.disassemble(choice).length;
    await interaction.followUp(
        `이번 문장은 ${
            random <= 1119 ? '한글' : '영어'
        } 문장입니다. 3초 후 문장이 출력되면 입력 버튼을 누른 후 주어진 문장을 입력해주세요.`
    );

    await setTimeout(3000); // 3초 대기

    const startRow = new ActionRowBuilder().addComponents([
        new ButtonBuilder().setCustomId('start').setLabel('입력').setStyle(ButtonStyle.Primary)
    ]);
    const gameStart = await interaction.followUp({
        content: `대결할 문장: ${[...choice].join('\u200b')}\n\n위 문장으로 대결을 수행합니다.`,
        components: [startRow]
    });

    const collector = gameStart.createMessageComponentCollector({ time: 60000 });
    const modalRow = new ActionRowBuilder().addComponents([
        new TextInputBuilder()
            .setCustomId('user_input')
            .setLabel('주어진 문장을 입력해주세요.')
            .setStyle(TextInputStyle.Short)
    ]);
    const modal = new ModalBuilder().setCustomId('typing_modal').setTitle('타자대결').addComponents([modalRow]);

    collector
        .on('collect', async (itr) => {
            try {
                const start = Date.now();
                await itr.showModal(modal);
                const submit = await itr.awaitModalSubmit({
                    filter: (itr) => itr.fields.getTextInputValue('user_input') === choice,
                    time: 40000
                });
                const time = (Date.now() - start) / 1000;
                await submit.reply(`${itr.member?.nickname ?? itr.user.username}님이 승리했습니다!
소요시간: ${time.toFixed(2)}초\n분당타수: ${((choiceLength * 60) / time).toFixed(2)}타`);
                collector.stop();
            } catch {}
        })
        .once('end', async () => {
            try {
                startRow.components[0].setDisabled(true);
                await gameStart.edit({ components: [startRow] });
            } catch {}
        });
}
