import { readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { parseEnv } from 'node:util';

const command = process.argv[2] ?? 'help';
const configPath = process.env.OPS_CONFIG_FILE
  ?? join(homedir(), '.local/share/01yang-company-website/ops/运维私有配置.env');

async function main() {
  if (command === 'help') {
    console.log('只读：npm run ops:status / ops:runs / ops:check\n配置同步（需临时写凭据）：node scripts/ops.mjs sync');
    return;
  }
  const stat = statSync(configPath);
  if (stat.mode & 0o077) throw new Error('私有配置权限过宽，请先设置为600。');
  const config = parseEnv(readFileSync(configPath, 'utf8'));
  if (command === 'check') {
    for (const [name, url, expected] of [
      ['官网', 'https://www.01yang.space/', config.OPS_EXPECT_PUBLIC === 'true' ? 200 : 503],
      ['25th', 'https://arch.25thgame.vip/game.html', 200],
    ]) {
      const response = await fetch(url, { signal: AbortSignal.timeout(15000), redirect: 'manual' });
      console.log(`${name}：HTTP ${response.status}，预期 ${expected}`);
      if (response.status !== expected) process.exitCode = 1;
    }
    return;
  }
  const org = config.YUNXIAO_ORGANIZATION_ID;
  const pipeline = config.YUNXIAO_PIPELINE_ID;
  const domain = config.YUNXIAO_FLOW_DOMAIN;
  if (domain !== 'https://openapi-rdc.aliyuncs.com') throw new Error('仅允许已配置的云效中心站接入点。');
  if (!org || !/^[a-zA-Z0-9]+$/.test(org) || !/^\d+$/.test(pipeline ?? '')) {
    throw new Error('请先在私有配置中登记官网组织和专属流水线ID。');
  }
  const base = `${domain}/oapi/v1/flow/organizations/${org}/pipelines/${pipeline}`;
  let method = 'GET';
  let body;
  let suffix;
  if (command === 'sync') {
    const content = readFileSync('deploy/aliyun-flow.yml', 'utf8');
    if (content.includes('__COMPANY_MACHINE_GROUP_ID__')) throw new Error('请先把官网主机组ID写入版本化YAML。');
    if (!process.env.YUNXIAO_SETUP_TOKEN) throw new Error('配置同步需临时YUNXIAO_SETUP_TOKEN，不使用五年只读令牌。');
    method = 'PUT';
    suffix = '';
    body = JSON.stringify({ name: '01yang-company-website-prod', content });
  } else if (command === 'status') {
    suffix = '/runs/latestPipelineRun';
  } else if (command === 'runs') {
    suffix = '/runs?page=1&perPage=5';
  } else {
    throw new Error('未知命令；不支持通过只读助手触发部署。');
  }
  const token = command === 'sync' ? process.env.YUNXIAO_SETUP_TOKEN : config.YUNXIAO_TOKEN;
  if (!token) throw new Error('官网令牌尚未配置。');
  const response = await fetch(`${base}${suffix}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-yunxiao-token': token },
    body,
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`云效请求失败：HTTP ${response.status}；未输出响应内容以避免泄露配置。`);
  const data = await response.json();
  if (command === 'sync') {
    if (data !== true) throw new Error('云效未确认配置同步成功。');
    console.log('版本化YAML已同步到官网专属流水线。');
  } else {
    for (const run of Array.isArray(data) ? data : [data]) {
      console.log(JSON.stringify({ runId: run.id ?? run.pipelineRunId, status: run.status, triggerMode: run.triggerMode, startTime: run.startTime, endTime: run.endTime }));
    }
  }
}

main().catch((error) => {
  console.error(error.code === 'ENOENT' ? '官网私有配置尚未建立，请参考deploy/ops.env.example。' : error.message);
  process.exitCode = 1;
});
