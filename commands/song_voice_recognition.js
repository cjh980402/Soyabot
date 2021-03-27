const { replyAdmin } = require('../admin/bot_control');
const { GOOGLE_API_KEY } = require("../soyabot_config.json");
const { Lame } = require('node-lame');
const fetch = require('node-fetch');
let botCalled = false;

function botVoiceCommand(message, transcription) {
    message.channel.send(`분석 결과: ${transcription}`);
    if (!botCalled && /(안녕|하이)\s*소야/.test(transcription)) {
        botCalled = true;
        setTimeout(() => { botCalled = false }, 60000); // 1분 후 호출 비활성화
        message.channel.send("소야봇을 호출하셨습니다.");
    }
    else if (botCalled) {
        const songcmd = /(.*)(노래|음악|재생\s*목록).*(틀어|재생)/.exec(transcription);
        if (songcmd) {
            botCalled = false;
            const args = (songcmd[1].trim() || "멜론 차트").split(/\s+/);
            client.commands.find((cmd) => cmd.command.includes(/재생\s*목록/.test(songcmd[2]) ? "playlist" : "play")).execute(message, args);
        }
        else {
            const args = transcription.split(/\s+/);
            const command = client.commands.find((cmd) => cmd.type.includes(args[0]) && cmd.command.includes(args[1]));
            if (command) {
                botCalled = false;
                command.execute(message, args.slice(2));
            }
        }
    }
}

module.exports = {
    usage: `${client.prefix}음성인식`,
    command: ["음성인식", "ㅇㅅㅇㅅ"],
    type: ["음악"],
    async execute(message) {
        if (!message.guild) {
            return message.replyTo("사용이 불가능한 채널입니다."); // 그룹톡 여부 체크
        }

        const { channel } = message.member.voice;
        const serverQueue = client.queue.get(message.guild.id);
        if (!channel || (serverQueue && channel != message.guild.me.voice.channel)) {
            return message.replyTo(`같은 음성 채널에 참가해주세요! (${client.user})`);
        }

        const permissions = channel.permissionsFor(client.user);
        if (!permissions.has("CONNECT")) {
            return message.replyTo("권한이 존재하지 않아 음성 채널에 연결할 수 없습니다.");
        }
        if (!permissions.has("SPEAK")) {
            return message.replyTo("이 음성 채널에서 말을 할 수 없습니다. 적절한 권한이 있는지 확인해야합니다.");
        }

        let connection = null;
        try {
            connection = serverQueue?.connection ?? await channel.join();
        }
        catch (e) {
            replyAdmin(`작성자: ${message.author.username}\n방 ID: ${message.channel.id}\n채팅 내용: ${message.content}\n에러 내용: ${e}\n${e?.stack}`);
            await channel.leave();
            return message.channel.send(`채널에 참가할 수 없습니다: ${e.message ?? e}`);
        }

        if (connection.listenerCount("speaking") > 0) { // 이미 음성인식이 실행 중인 경우
            if (!serverQueue) { // 음악 기능이 실행 중이지 않을 때만 연결을 끊는다.
                connection.disconnect();
            }
            connection.removeAllListeners("speaking");
            return message.channel.send("실행 중인 기능을 종료합니다.");
        }
        const receiver = connection.receiver;

        message.channel.send("기능 시작");
        if (!serverQueue) {
            connection.onSessionDescription("음성인식 테스트"); // Silence 버퍼 자동 전송
        }
        connection.on('speaking', async (user, speaking) => {
            if (speaking) {
                // 분석을 위한 음성 녹음 시작
                const audioStream = receiver.createStream(user, { mode: 'pcm' });
                const pcmBufferChunks = [];
                audioStream.on('data', (d) => {
                    pcmBufferChunks.push(d);
                });

                audioStream.on('end', async () => {
                    // 음성 녹음 종료
                    const pcmBuffer = Buffer.concat(pcmBufferChunks);

                    const encoder = new Lame({
                        output: 'buffer',
                        bitrate: 48,
                    }).setBuffer(pcmBuffer);
                    await encoder.encode();
                    // 녹음된 pcm 버퍼를 mp3로 인코딩

                    // API에 분석 정보 요청
                    const response = await fetch(`https://speech.googleapis.com/v1p1beta1/speech:recognize?alt=json&key=${GOOGLE_API_KEY}`, {
                        method: 'POST',
                        body: JSON.stringify({
                            config: {
                                encoding: 'MP3',
                                sampleRateHertz: 48000,
                                languageCode: 'ko-KR',
                            },
                            audio: {
                                content: encoder.getBuffer().toString('base64'),
                            }
                        })
                    });
                    const transcription = (await response.json()).results?.map(result => result.alternatives[0].transcript).join("\n").trim();
                    if (transcription) {
                        botVoiceCommand(message, transcription);
                    }
                });
            }
        });
    }
};