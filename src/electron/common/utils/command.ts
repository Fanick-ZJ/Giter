import { execSync } from 'child_process';

export const execOutputStr = (cmd: string, cwd: string) => {
    let cmdRes: string
    if (process.platform == 'win32') {
        cmdRes = execSync(cmd, {cwd: cwd, encoding: 'utf8', shell: 'powershell'})
    } else {
        cmdRes = execSync(cmd, {cwd: cwd, encoding: 'utf8'})
    }
    return cmdRes.trim()
}