#!/usr/bin/env bash
set -euo pipefail
# 构建子进程不使用发布凭据。
unset COMPANY_DEPLOY_SSH_KEY
# 仅在云效公共Linux构建环境运行；不在生产ECS安装Node。
test "$(cat .nvmrc)" = '24.16.0'
node_runtime=$(mktemp -d)
archive="$node_runtime/node-v24.16.0-linux-x64.tar.gz"
curl -fsSL --retry 3 --max-time 180 \
  https://nodejs.org/dist/v24.16.0/node-v24.16.0-linux-x64.tar.gz -o "$archive"
printf '%s  %s\n' 2faf6a387e9b62b888e21c54f01249fb27537ffecf1842f29f4c919d0a59a0ff "$archive" | sha256sum --check -
tar -xzf "$archive" -C "$node_runtime"
export PATH="$node_runtime/node-v24.16.0-linux-x64/bin:$PATH"
test "$(node --version)" = 'v24.16.0'
npm ci --no-audit --no-fund
npm run ci:verify
python3 -m unittest discover -s tests -v
