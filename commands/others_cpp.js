const { ADMIN_ID } = require('../soyabot_config.json');
const { writeFile } = require('fs').promises;
const { cmd } = require('../admin/admin_function');
const { spawn } = require('child_cppProcessess');
let cppProcess = null;

module.exports = {
    usage: `${client.prefix}cpp (소스코드)`,
    command: ['cpp'],
    type: ['기타'],
    async messageExecute(message, args) {
        if (message.author.id === ADMIN_ID && args.length > 0) {
            if (cppProcess) {
                cppProcess.stdin.write(`${args.join(' ')}\n`);
            } else {
                const sourceCode = message.content.replace(/\s*.+?\s*.+?\s+/, '').trim();
                await writeFile(`./other_source/cpp_source.cpp`, sourceCode);
                const compile = await cmd('g++ -o ./other_source/cpp_result.out ./other_source/cpp_source.cpp', true);
                if (compile) {
                    return message.channel.send(compile); // 컴파일 에러 출력
                }
                cppProcess = spawn('./other_source/cpp_result.out');
                cppProcess.stderr.on('data', (data) => {
                    message.channel.sendSplitCode(String(data), { split: { char: '' } });
                });
                cppProcess.stdout.on('data', (data) => {
                    message.channel.sendSplitCode(String(data), { split: { char: '' } });
                });
                cppProcess.on('exit', (code) => {
                    message.channel.send(`Process exited with code ${code}`);
                    cppProcess = null;
                });
                cppProcess.on('error', (code) => {
                    message.channel.send(`Process throws an error with code ${code}`);
                    cppProcess = null;
                });
            }
        }
    }
};
