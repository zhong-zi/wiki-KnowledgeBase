#!/usr/bin/env node
/**
 * 从官方镜像重新导出企业版编译产物到 vendor/ee-dist。
 *
 * 使用固定 digest（见 vendor/IMAGE.txt），避免拉到的 latest 变成别的版本，
 * 导致 EE 的 JS 与当前源码编译产物接口不一致。
 *
 * 用法：node scripts/fetch-ee.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const metaFile = path.join(root, 'vendor', 'IMAGE.txt');
const destDir = path.join(root, 'vendor', 'ee-dist');

function fail(msg) {
  console.error('[fetch-ee] 错误：' + msg);
  process.exit(1);
}

if (!fs.existsSync(metaFile)) {
  fail('缺少 vendor/IMAGE.txt，无法确定要拉取哪个版本的镜像。');
}

const meta = {};
for (const line of fs.readFileSync(metaFile, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([a-z_]+)\s*=\s*(.+)$/i);
  if (m) meta[m[1].toLowerCase()] = m[2].trim();
}

const ref = meta.digest ? `${meta.image}@${meta.digest}` : `${meta.image}:${meta.tag}`;
console.log(`[fetch-ee] 目标镜像：${ref}`);

function run(cmd, args, opts) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  if (r.status !== 0) fail(`${cmd} ${args.join(' ')} 执行失败（退出码 ${r.status}）`);
  return r;
}

// 1. 拉取固定 digest 的镜像（本地已有则跳过）
const inspect = spawnSync('docker', ['image', 'inspect', ref], { stdio: 'ignore' });
if (inspect.status !== 0) {
  run('docker', ['pull', ref]);
} else {
  console.log('[fetch-ee] 本地已有该镜像，跳过拉取');
}

// 2. 创建临时容器并导出 dist/ee
const created = spawnSync('docker', ['create', ref], { encoding: 'utf8' });
if (created.status !== 0) fail('docker create 失败：' + (created.stderr || '').slice(0, 300));
const cid = created.stdout.trim();

try {
  fs.rmSync(destDir, { recursive: true, force: true });
  fs.mkdirSync(destDir, { recursive: true });
  run('docker', ['cp', `${cid}:/app/apps/server/dist/ee/.`, destDir]);
} finally {
  spawnSync('docker', ['rm', '-f', cid], { stdio: 'ignore' });
}

// 3. 基本校验
const dirs = fs
  .readdirSync(destDir)
  .filter((n) => fs.statSync(path.join(destDir, n)).isDirectory());
if (!fs.existsSync(path.join(destDir, 'ee.module.js'))) fail('导出的内容里没有 ee.module.js');
if (dirs.length < 25) fail(`EE 模块数量异常，只导出了 ${dirs.length} 个目录`);

console.log(`[fetch-ee] 完成：${dirs.length} 个 EE 模块已导出到 vendor/ee-dist`);
console.log('[fetch-ee] 下一步执行 node scripts/sync-ee.js（或直接 pnpm build，已自动包含）');
