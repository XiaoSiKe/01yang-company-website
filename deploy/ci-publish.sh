#!/usr/bin/env bash
set +x
set -euo pipefail
umask 077
test -n "${COMPANY_DEPLOY_SSH_KEY:-}"
test -f dist/client/SHA256SUMS
test -f deploy/known_hosts

ci_ssh_dir=$(mktemp -d "${TMPDIR:-/tmp}/01yang-flow-ssh.XXXXXXXX")
cleanup() {
  result=$?
  if [[ -d "$ci_ssh_dir" && "${ci_ssh_dir##*/}" == 01yang-flow-ssh.* ]]; then rm -rf -- "$ci_ssh_dir"; fi
  exit "$result"
}
trap cleanup EXIT
trap 'exit 143' TERM
trap 'exit 129' HUP
trap 'exit 130' INT

printf '%s\n' "$COMPANY_DEPLOY_SSH_KEY" > "$ci_ssh_dir/key"
unset COMPANY_DEPLOY_SSH_KEY
chmod 600 "$ci_ssh_dir/key"
archive="$ci_ssh_dir/release.tgz"
tar -czf "$archive" -C dist/client .
printf '官网压缩制品 SHA-256：'
sha256sum "$archive" | cut -d ' ' -f 1
ssh -T -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes \
  -o UserKnownHostsFile=deploy/known_hosts -o ConnectTimeout=15 \
  -o ServerAliveInterval=15 -o ServerAliveCountMax=4 \
  -i "$ci_ssh_dir/key" 01yang-deploy@47.106.14.254 publish < "$archive"
