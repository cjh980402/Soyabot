import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { exec } from '../admin/admin_function.js';
import { ADMIN_ID } from '../soyabot_config.js';
let cppProcess = null;

export const usage = `${client.prefix}cpp (소스코드)`;
export const command = ['cpp'];
export const type = ['기타'];
export async function messageExecute(message, args) {
    if (message.author.id === ADMIN_ID && args.length > 0) {
        if (cppProcess) {
            cppProcess.stdin.write(`${args.join(' ')}\n`);
        } else {
            const sourceCode = message.content.replace(/\s*.+?\s+/, '').trim();
            await writeFile(`./other_source/cpp_source.cpp`, sourceCode);
            const { stdout: compile } = await exec(
                'g++ ./other_source/cpp_source.cpp -o ./other_source/cpp_result.out'
            );
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
            cppProcess.on('error', (err) => {
                message.channel.send(`Process throws an error (${err})`);
                cppProcess = null;
            });
            cppProcess.on('exit', (code) => {
                message.channel.send(`Process exited with code ${code}`);
                cppProcess = null;
            });
        }
    }
}
