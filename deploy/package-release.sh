#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -n "$(git status --porcelain)" ]]; then
  printf '发布打包要求干净的工作区，请先提交已验证的改动。\n' >&2
  exit 1
fi
npm run verify:static
commit=$(git rev-parse HEAD)
test "$(node -p "JSON.parse(require('fs').readFileSync('dist/client/version.json')).commit")" = "$commit"
mkdir -p artifacts
archive="artifacts/01yang-company-website-${commit}.tgz"
COPYFILE_DISABLE=1 tar -czf "$archive" -C dist/client .
shasum -a 256 "$archive" > "$archive.sha256"
printf '已生成 %s 及 SHA-256 校验文件。\n' "$archive"
