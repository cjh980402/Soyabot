const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
// 각각의 ChartJSNodeCanvas는 자체 캔버스를 만드므로 메모리 관리, GC 동작을 보장하기 위해 적은 인스턴스를 생성하고 재사용해야함
const chartCanvas = new ChartJSNodeCanvas({
    width: 1000,
    height: 1000,
    plugins: {
        requireLegacy: ['chartjs-plugin-datalabels', 'chartjs-plugin-doughnutlabel']
    },
    chartCallback: (ChartJS) => {
        ChartJS.defaults.global.defaultFontFamily = 'NanumBarunGothic, Symbola, CODE2000';
    }
});
chartCanvas.registerFont('./fonts/NanumBarunGothic.ttf', { family: 'NanumBarunGothic' });
chartCanvas.registerFont('./fonts/Symbola.ttf', { family: 'Symbola' });
chartCanvas.registerFont('./fonts/CODE2000.ttf', { family: 'CODE2000' });

module.exports = function (configuration, width, height, color = 'white') {
    chartCanvas._width = width; // 차트의 너비 변경
    chartCanvas._height = height; // 차트의 높이 변경
    if (!(configuration.plugins instanceof Array)) {
        configuration.plugins = []; // configuration.plugins은 항상 배열
    }
    configuration.plugins.push({
        id: 'custom_canvas_background_color',
        beforeDraw: (chart) => {
            const ctx = chart.canvas.getContext('2d');
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
        }
    }); // 배경색 설정을 위한 플러그인 추가
    return chartCanvas.renderToBuffer(configuration);
};
