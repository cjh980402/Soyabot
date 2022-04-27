import { ApplicationCommandOptionType } from 'discord.js';
const picmatch = {
    포이즈닉: 'poisonic',
    자쿰: 'poisonic',
    네크로: 'necro',
    반레온: 'von_leon',
    쟈이힌: 'jaihind',
    여제: 'cygnus',
    우트가르드: 'utgard',
    파프니르: 'fafnir',
    파프: 'fafnir',
    앱솔랩스: 'absolute_labs',
    앱솔: 'absolute_labs',
    아케인셰이드: 'arcaneshade',
    아케인: 'arcaneshade',
    제네시스: 'genesis',
    제네: 'genesis',
    제로: 'zero',
    해카세: 'others',
    기타: 'others'
};

export const type = ['메이플'];
export const commandData = {
    name: '추옵',
    description: '해당하는 무기의 추옵표를 출력합니다.',
    options: [
        {
            name: '무기종류',
            type: ApplicationCommandOptionType.String,
            description: '추옵 정보를 검색할 무기의 종류',
            choices: Object.keys(picmatch).map((v) => ({ name: v, value: v })),
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    const weapon = interaction.options.getString('무기종류');
    await interaction.followUp({
        content: `${weapon} 무기의 추옵표`,
        files: [`./pictures/add_option/${picmatch[weapon]}.png`]
    });
}
