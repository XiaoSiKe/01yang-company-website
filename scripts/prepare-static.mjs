import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = 'dist/client';
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error('无法确定构建提交。');

// Vite 的服务端构建索引不是公开站点资源，可随构建重新生成。
rmSync(join(root, '.vite'), { recursive: true, force: true });

writeFileSync(join(root, 'version.json'), `${JSON.stringify({
  commit,
  builtAt: new Date().toISOString(),
}, null, 2)}\n`);

function files(directory, prefix = '') {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const name = `${prefix}${entry.name}`;
    if (entry.isSymbolicLink()) throw new Error(`制品不允许符号链接：${name}`);
    if (entry.isDirectory()) return files(join(directory, entry.name), `${name}/`);
    return entry.isFile() && name !== 'SHA256SUMS' ? [name] : [];
  });
}

const sums = files(root).sort().map((name) => {
  const digest = createHash('sha256').update(readFileSync(join(root, name))).digest('hex');
  return `${digest}  ${name}`;
});
writeFileSync(join(root, 'SHA256SUMS'), `${sums.join('\n')}\n`);
console.log(`已生成静态制品版本与 ${sums.length} 个文件的校验清单。`);
