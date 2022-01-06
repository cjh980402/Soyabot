const picmatch = {
    앗볶음: 'AtFried',
    헉튀김: 'HeokFried',
    허허말이: 'HeoheoRoll',
    이런면: 'ThisNoodle',
    저런찜: 'ThatBraised',
    호호탕: 'HohoTang',
    으악샐러드: 'UakSalad',
    크헉구이: 'KheokGriled',
    깔깔만두: 'laughinMandoo',
    낄낄볶음밥: 'KilkilFried',
    오잉피클: 'OingPickle',
    휴피자: 'HyooPizza',
    하빵: 'HaBread',
    큭큭죽: 'KeukkeukSoup',
    엉엉순대: 'CryingSundae',
    흑흑화채: 'HeukheukHwachae'
};

export const usage = `${client.prefix}무토 (요리 이름)`;
export const command = ['무토', 'ㅁㅌ'];
export const description = `- 해당하는 요리의 레시피를 출력합니다.
- (요리 이름): ${Object.keys(picmatch).join(', ')} 입력가능`;
export const type = ['메이플'];
export async function messageExecute(message, args) {
    if (picmatch[args[0]]) {
        return message.channel.send({
            content: `${args[0]} 요리의 레시피`,
            files: [`./pictures/muto/${picmatch[args[0]]}.png`]
        });
    } else {
        return message.channel.send(`**${usage}**\n- 대체 명령어: ${command.join(', ')}\n${description}`);
    }
}
export const commandData = {
    name: '무토',
    description: '해당하는 요리의 레시피를 출력합니다.',
    options: [
        {
            name: '요리_이름',
            type: 'STRING',
            description: '추옵 정보를 검색할 무기의 종류',
            required: true,
            choices: Object.keys(picmatch).map((v) => ({ name: v, value: v }))
        }
    ]
};
export async function commandExecute(interaction) {
    const food = interaction.options.getString('요리_이름');
    return interaction.followUp({ content: `${food} 요리의 레시피`, files: [`./pictures/muto/${picmatch[food]}.png`] });
}
