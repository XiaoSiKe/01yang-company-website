import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve('dist/client');
function listFiles(directory, prefix = '') {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const name = `${prefix}${entry.name}`;
    assert.ok(!entry.isSymbolicLink(), `制品包含符号链接：${name}`);
    if (entry.isDirectory()) return listFiles(join(directory, entry.name), `${name}/`);
    assert.ok(entry.isFile(), `制品包含特殊文件：${name}`);
    return [name];
  });
}
const actualFiles = listFiles(root);
for (const name of actualFiles) {
  assert.ok(!name.split('/').some((part) => part.startsWith('.')), `制品包含隐藏文件：${name}`);
  assert.ok(!/(^|\/)(?:node_modules|package(?:-lock)?\.json|ops\.env[^/]*)(\/|$)|\.(?:pem|key|p12|pfx|py|sh|ts|tsx)$/.test(name), `制品包含非静态或敏感文件：${name}`);
}
const required = ['index.html', 'index.rsc', '404.html', 'robots.txt', 'sitemap.xml',
  'version.json', 'SHA256SUMS', '01yang-logo.jpg', 'wechat-qr.jpg', 'og.png',
  ...[1015, 1018, 1039, 1043, 1044].map((id) => `projects/${id}.jpg`)];
for (const file of required) assert.ok(existsSync(join(root, file)), `缺少制品：${file}`);

const html = readFileSync(join(root, 'index.html'), 'utf8');
assert.ok(html.includes('福州零一扬网络科技有限公司'), '首页公司名称缺失');
assert.ok(html.includes('闽ICP备2026024313号-2'), '首页备案信息缺失');
assert.ok(!html.includes('/_next/image?'), '静态站点不能依赖图片优化接口');
assert.ok(!/https?:\/\/(?:fonts\.(?:googleapis|gstatic)\.com|picsum\.photos)/.test(html), '首页仍依赖远程字体或占位图');

function checkReference(reference) {
  const path = decodeURIComponent(reference.replaceAll('&amp;', '&').split(/[?#]/)[0]);
  if (!path || path === '/') return;
  const file = resolve(root, `.${path}`);
  assert.ok(file.startsWith(`${root}/`), `资源越界：${reference}`);
  assert.ok(existsSync(file), `资源引用不存在：${path}`);
}
for (const match of html.matchAll(/\b(?:src|href)=["'](\/[^"'<>]*)["']/g)) checkReference(match[1]);

const manifest = readFileSync(join(root, 'SHA256SUMS'), 'utf8').trim().split('\n');
const listedFiles = new Set();
let cssBundle = '';
for (const line of manifest) {
  const match = /^([a-f0-9]{64})  ([^\r\n]+)$/.exec(line);
  assert.ok(match, '无效的 SHA256SUMS 行');
  const [, expected, name] = match;
  assert.ok(!listedFiles.has(name), `清单包含重复文件：${name}`);
  listedFiles.add(name);
  const file = resolve(root, name);
  assert.ok(file.startsWith(`${root}/`) && !name.startsWith('.'), `非法制品路径：${name}`);
  assert.ok(!/(^|\/)(?:node_modules|\.git|\.env[^/]*)(\/|$)|\.(?:pem|key|p12|pfx)$/.test(name), `制品含非公开文件：${name}`);
  assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'), expected, `校验失败：${name}`);
  if (name.endsWith('.css')) {
    const css = readFileSync(file, 'utf8');
    cssBundle += css;
    for (const match of css.matchAll(/url\(["']?(\/[^)'"\s]+)["']?\)/g)) checkReference(match[1]);
  }
}
assert.deepEqual([...listedFiles].sort(), actualFiles.filter((name) => name !== 'SHA256SUMS').sort(), '制品文件集合与校验清单不一致');
assert.match(cssBundle, /(?<!-)backdrop-filter\s*:\s*saturate\(180%\)\s*blur\(40px\)/, '压缩CSS丢失标准导航玻璃效果声明');
const version = JSON.parse(readFileSync(join(root, 'version.json'), 'utf8'));
assert.match(version.commit, /^[a-f0-9]{40}$/);
assert.ok(Number.isFinite(Date.parse(version.builtAt)), '构建时间无效');
assert.ok(readdirSync(join(root, '_next/static/_vinext_fonts')).length > 0, '本地字体缺失');
assert.ok(statSync(join(root, 'index.html')).size > 1000, '首页可能为空');
console.log(`静态制品检查通过：${manifest.length} 个文件，提交 ${version.commit.slice(0, 12)}。`);
