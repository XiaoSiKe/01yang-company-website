#!/usr/bin/env bash
# 仅初始化公司官网专属资源；不得作为日常流水线用户执行。
set -euo pipefail
umask 022
readonly ROOT=/var/www/01yang-company-website
readonly CONTROL=/etc/01yang-company-website
readonly CONFIG=/etc/nginx/conf.d/010-01yang-company-website.conf
readonly LIB=/usr/local/lib/01yang-company-website
readonly SOURCE=$(cd "$(dirname "$0")" && pwd)
mode=${1:-init}
[[ $(id -u) == 0 ]] || { printf '初始化需要管理员权限。\n' >&2; exit 1; }
[[ "$mode" == init || "$mode" == tls ]] || { printf '仅支持 init 或 tls。\n' >&2; exit 1; }

assert_plain_path() {
  local current='' part
  local -a parts
  IFS=/ read -r -a parts <<< "$1"
  for part in "${parts[@]}"; do
    [[ -n "$part" ]] || continue
    current="$current/$part"
    [[ ! -L "$current" ]] || { printf '受管路径存在符号链接，停止以免影响其它站点：%s\n' "$current" >&2; exit 1; }
  done
}
for path in "$ROOT" "$ROOT/releases" "$ROOT/shared" "$ROOT/shared/static" "$ROOT/shared/successful" "$ROOT/shared/incoming" \
  "$CONTROL" "$CONTROL/nginx-tls.conf" "$CONTROL/tls-ready" "$CONTROL/public-enabled" "$CONFIG" \
  "$LIB" "$LIB/release.sh" "$LIB/verify-archive.py" /var/backups/01yang-company-website \
  /var/lib/01yang-company-website/acme /var/lib/01yang-company-website/deploy-home \
  /etc/letsencrypt-01yang /var/lib/letsencrypt-01yang /var/log/letsencrypt-01yang \
  /etc/systemd/system/01yang-company-certbot.service /etc/systemd/system/01yang-company-certbot.timer; do
  assert_plain_path "$path"
done
if id 01yang-deploy > /dev/null 2>&1; then
  [[ $(getent passwd 01yang-deploy | cut -d: -f6) == /var/lib/01yang-company-website/deploy-home ]] || {
    printf '已有同名用户的家目录与官网约定不符，停止。\n' >&2; exit 1;
  }
fi
nginx -t
game_before=$(sha256sum /etc/nginx/conf.d/000-25thgame.conf /etc/nginx/sites-enabled/beian)
game_target=$(readlink -f /var/www/25thgame/current)
curl -fsS --max-time 15 --resolve arch.25thgame.vip:443:127.0.0.1 https://arch.25thgame.vip/game.html -o /dev/null

install -d -m 700 /var/backups/01yang-company-website
backup=$(mktemp -d /var/backups/01yang-company-website/change.XXXXXXXX)
printf '%s\n%s\n' "$game_before" "$game_target" > "$backup/25th-baseline.txt"
had_config=0
config_changed=0
if [[ -f "$CONFIG" ]]; then
  grep -q 'server_name www.01yang.space' "$CONFIG" || { printf '目标配置并非公司官网，停止覆盖。\n' >&2; exit 1; }
  cp -a "$CONFIG" "$backup/nginx.conf"
  had_config=1
fi
cleanup() {
  result=$?
  if (( result != 0 && config_changed == 1 )); then
    if (( had_config == 1 )); then cp -a "$backup/nginx.conf" "$CONFIG"; else rm -f -- "$CONFIG"; fi
    if nginx -t; then systemctl reload nginx; fi
    printf '初始化未完成，已恢复官网原入口配置，备份：%s\n' "$backup" >&2
  fi
  exit "$result"
}
trap cleanup EXIT
trap 'exit 143' TERM
trap 'exit 129' HUP
trap 'exit 130' INT

install -d -m 755 "$CONTROL" "$LIB" /var/lib/01yang-company-website /var/lib/01yang-company-website/acme
if ! id 01yang-deploy > /dev/null 2>&1; then
  useradd --system --user-group --create-home --home-dir /var/lib/01yang-company-website/deploy-home --shell /bin/bash 01yang-deploy
fi
for directory in "$ROOT" "$ROOT/releases" "$ROOT/shared" "$ROOT/shared/static" "$ROOT/shared/successful" "$ROOT/shared/incoming"; do
  install -d -m 755 -o 01yang-deploy -g 01yang-deploy "$directory"
done
install -m 755 "$SOURCE/release.sh" "$LIB/release.sh"
install -m 755 "$SOURCE/verify-archive.py" "$LIB/verify-archive.py"
install -m 644 "$SOURCE/nginx.conf" "$CONTROL/nginx-tls.conf"

if [[ -f "$SOURCE/deploy-key.pub" ]]; then
  key_dir=/var/lib/01yang-company-website/deploy-home/.ssh
  assert_plain_path "$key_dir/authorized_keys"
  grep -q '^restrict ssh-ed25519 ' "$SOURCE/deploy-key.pub"
  install -d -m 700 -o 01yang-deploy -g 01yang-deploy "$key_dir"
  if [[ -f "$key_dir/authorized_keys" ]]; then
    cmp -s "$SOURCE/deploy-key.pub" "$key_dir/authorized_keys" || { printf '官网用户已有不同SSH授权，停止覆盖。\n' >&2; exit 1; }
  else
    install -m 600 -o 01yang-deploy -g 01yang-deploy "$SOURCE/deploy-key.pub" "$key_dir/authorized_keys"
  fi
fi

if [[ "$mode" == init ]]; then
  if [[ -f "$CONTROL/tls-ready" ]]; then
    printf '官网已启用TLS，保留当前Nginx配置，仅更新部署工具。\n'
  else
    config_changed=1
    install -m 644 "$SOURCE/nginx-http.conf" "$CONFIG"
  fi
else
  command -v certbot > /dev/null
  certbot certonly --non-interactive --agree-tos --email 1241798750@qq.com \
    --webroot -w /var/lib/01yang-company-website/acme \
    --cert-name 01yang-company-website -d www.01yang.space -d 01yang.space \
    --config-dir /etc/letsencrypt-01yang --work-dir /var/lib/letsencrypt-01yang \
    --logs-dir /var/log/letsencrypt-01yang --keep-until-expiring
  config_changed=1
  install -m 644 "$CONTROL/nginx-tls.conf" "$CONFIG"
fi

nginx -t
systemctl reload nginx
test "$(sha256sum /etc/nginx/conf.d/000-25thgame.conf /etc/nginx/sites-enabled/beian)" = "$game_before"
test "$(readlink -f /var/www/25thgame/current)" = "$game_target"
curl -fsS --max-time 15 --resolve arch.25thgame.vip:443:127.0.0.1 https://arch.25thgame.vip/game.html -o /dev/null
if [[ "$mode" == tls ]]; then
  install -m 644 "$SOURCE/01yang-company-certbot.service" /etc/systemd/system/01yang-company-certbot.service
  install -m 644 "$SOURCE/01yang-company-certbot.timer" /etc/systemd/system/01yang-company-certbot.timer
  systemctl daemon-reload
  systemctl enable --now 01yang-company-certbot.timer
  touch "$CONTROL/tls-ready"
fi
printf '官网独立入口初始化完成；25th配置和发布指针未改变。备份：%s\n' "$backup"
printf '未创建public-enabled开关，外部访问仍受备案验收门槛控制。\n'
