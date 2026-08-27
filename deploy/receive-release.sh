#!/usr/bin/env bash
# CI专用SSH密钥只能通过本入口发送制品，不能运行任意命令。
set -euo pipefail
umask 077
readonly ROOT=/var/www/01yang-company-website
[[ "${SSH_ORIGINAL_COMMAND:-}" == publish ]] || { printf '此密钥仅允许官网制品发布。\n' >&2; exit 1; }
[[ $(id -un) == 01yang-deploy ]] || exit 1
[[ $(readlink -f "$ROOT/shared/incoming") == "$ROOT/shared/incoming" ]] || exit 1
incoming=$(mktemp -d "$ROOT/shared/incoming/ci.XXXXXXXX")
cleanup() {
  result=$?
  if [[ "$incoming" == "$ROOT/shared/incoming/ci."* && -d "$incoming" ]]; then rm -rf -- "$incoming"; fi
  exit "$result"
}
trap cleanup EXIT
trap 'exit 143' TERM
trap 'exit 129' HUP
trap 'exit 130' INT
# 为压缩输入设置64MiB上限；解包还有独立路径、文件数和体积校验。
head -c 67108865 > "$incoming/release.tgz"
[[ $(wc -c < "$incoming/release.tgz") -le 67108864 ]] || { printf '压缩制品超过64MiB。\n' >&2; exit 1; }
/usr/local/lib/01yang-company-website/release.sh "$incoming/release.tgz"
