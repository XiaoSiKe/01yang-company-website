#!/usr/bin/env bash
set -euo pipefail
umask 022

readonly ROOT=/var/www/01yang-company-website
readonly VERIFY=/usr/local/lib/01yang-company-website/verify-archive.py
readonly CONTROL=/etc/01yang-company-website
staging=''
switched=0
old_target=''

die() { printf '%s\n' "$*" >&2; exit 1; }
valid_release() { [[ "$1" =~ ^[0-9]{14}-[a-f0-9]{12}$ ]]; }
site_get() {
  if [[ -f "$CONTROL/tls-ready" ]]; then
    curl --fail --silent --show-error --max-time 15 --resolve www.01yang.space:443:127.0.0.1 "https://www.01yang.space$1"
  else
    curl --fail --silent --show-error --max-time 15 -H 'Host: www.01yang.space' "http://127.0.0.1$1"
  fi
}
game_get() {
  curl --fail --silent --show-error --max-time 15 --resolve arch.25thgame.vip:443:127.0.0.1 'https://arch.25thgame.vip/version.json'
}
point_to() {
  ln -s "$1" "$ROOT/.current.$$"
  mv -Tf "$ROOT/.current.$$" "$ROOT/current"
}
cleanup() {
  result=$?
  if (( result != 0 && switched == 1 )); then
    if [[ -n "$old_target" ]]; then
      point_to "$old_target"
      printf '验收失败，已恢复官网上一版本。\n' >&2
    elif [[ -L "$ROOT/current" ]]; then
      unlink "$ROOT/current"
      printf '首次预部署失败，已恢复无活动版本状态。\n' >&2
    fi
  fi
  if [[ -n "$staging" && "$staging" == "$ROOT/releases/.incoming."* && -d "$staging" ]]; then
    rm -rf -- "$staging"
  fi
  exit "$result"
}
trap cleanup EXIT
trap 'exit 143' TERM
trap 'exit 129' HUP
trap 'exit 130' INT

[[ "$(id -un)" == '01yang-deploy' ]] || die '必须以官网专属用户 01yang-deploy 执行。'
[[ -d "$ROOT/releases" && -d "$ROOT/shared/successful" ]] || die '官网初始化尚未完成。'
for directory in "$ROOT" "$ROOT/releases" "$ROOT/shared" "$ROOT/shared/static" "$ROOT/shared/successful"; do
  [[ "$(readlink -f "$directory")" == "$directory" ]] || die '官网目录存在意外重定向，停止发布。'
done
exec 9>"$ROOT/shared/deploy.lock"
flock -n 9 || die '另一个官网发布正在执行，请稍后重试。'
game_before=$(game_get)
curl --fail --silent --show-error --max-time 15 --resolve arch.25thgame.vip:443:127.0.0.1 'https://arch.25thgame.vip/game.html' -o /dev/null
if [[ -e "$ROOT/current" || -L "$ROOT/current" ]]; then
  [[ -L "$ROOT/current" ]] || die 'current 不是符号链接，停止以免覆盖。'
  old_target=$(readlink -f "$ROOT/current")
  [[ "$old_target" == "$ROOT/releases/"* ]] || die '原发布指针不在官网目录内。'
  valid_release "${old_target##*/}" || die '原发布版本名称异常。'
fi

if [[ "${1:-}" == '--rollback' ]]; then
  release=${2:-}
  valid_release "$release" || die '回滚版本格式错误。'
  [[ -f "$ROOT/shared/successful/$release" && -d "$ROOT/releases/$release" ]] || die '只能回滚到已验证成功的版本。'
else
  [[ $# == 1 && -f "$1" ]] || die '用法：release.sh 制品.tgz 或 release.sh --rollback 版本ID'
  staging=$(mktemp -d "$ROOT/releases/.incoming.XXXXXXXX")
  release=$(python3 "$VERIFY" "$1" "$staging")
  valid_release "$release" || die '制品版本格式错误。'
  if [[ -d "$ROOT/releases/$release" ]]; then
    cmp -s "$staging/SHA256SUMS" "$ROOT/releases/$release/SHA256SUMS" || die '相同版本ID对应不同制品，停止覆盖。'
  else
    chmod 755 "$staging"
    mv "$staging" "$ROOT/releases/$release"
    staging=''
  fi
fi

target="$ROOT/releases/$release"
(cd "$target" && sha256sum --quiet --check SHA256SUMS) || die '发布版本文件已改变，停止切换。'
# 内容寻址的资源只追加；旧页面与回滚版本仍可读取原资源。
if [[ -d "$target/_next/static" ]]; then
  cp -a -n "$target/_next/static/." "$ROOT/shared/static/"
fi
switched=1
point_to "$target"
site_get '/version.json' | cmp -s - "$target/version.json" || die '官网版本健康检查失败。'
site_get '/' | grep '福州零一扬网络科技有限公司' > /dev/null || die '官网首页健康检查失败。'
for file in /01yang-logo.jpg /wechat-qr.jpg /robots.txt /sitemap.xml; do
  site_get "$file" > /dev/null || die '官网关键静态资源健康检查失败。'
done
for extension in js css; do
  asset=$(find "$target/_next/static" -type f -name "*.$extension" -print -quit)
  [[ -n "$asset" ]] || die '缺少关键客户端资源。'
  site_get "${asset#"$target"}" > /dev/null || die '官网客户端资源健康检查失败。'
done
test "$(game_get)" = "$game_before" || die '25th 响应在发布过程中发生变化，停止官网发布。'
if [[ -n "$old_target" && "$old_target" != "$target" ]]; then
  ln -s "$old_target" "$ROOT/.previous.$$"
  mv -Tf "$ROOT/.previous.$$" "$ROOT/previous"
fi
touch "$ROOT/shared/successful/$release"
switched=0
printf '官网版本已验证并激活：%s\n' "$release"
if [[ ! -f "$CONTROL/public-enabled" ]]; then
  printf '当前为维护态预部署：外部访问保持503，未正式上线。\n'
fi

# 只清理官网自身已成功发布的旧版本；current/previous 始终保留。
while IFS= read -r expired; do
  valid_release "$expired" || continue
  candidate="$ROOT/releases/$expired"
  [[ "$candidate" != "$(readlink -f "$ROOT/current")" ]] || continue
  [[ ! -L "$ROOT/previous" || "$candidate" != "$(readlink -f "$ROOT/previous")" ]] || continue
  [[ -d "$candidate" && ! -L "$candidate" ]] || continue
  rm -rf -- "$candidate"
  rm -- "$ROOT/shared/successful/$expired"
  printf '已按保留策略清理官网旧版本：%s（可从对应云效制品恢复）\n' "$expired"
done < <(find "$ROOT/shared/successful" -maxdepth 1 -type f -printf '%f\n' | sort -r | tail -n +6)
