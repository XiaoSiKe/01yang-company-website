import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';

// 只为官网选择独立的GitHub认证，不切换其它项目的全局账号。
const env = {
  ...process.env,
  GH_CONFIG_DIR: join(homedir(), '.local/share/01yang-company-website/ops/github'),
};
for (const key of ['GH_TOKEN', 'GITHUB_TOKEN', 'GH_REPO', 'GH_HOST', 'GH_DEBUG']) {
  delete env[key];
}
const result = spawnSync('gh', process.argv.slice(2), { env, stdio: 'inherit' });
if (result.error) console.error(`无法启动GitHub CLI：${result.error.code}`);
process.exitCode = result.status ?? 1;
