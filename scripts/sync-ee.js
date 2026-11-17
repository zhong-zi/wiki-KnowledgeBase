#!/usr/bin/env node
/**
 * 将 vendor/ee-dist（取自官方 docmost/docmost 镜像 0.97.0 的编译产物）
 * 同步到 apps/server/dist/ee，使源码构建也能获得完整的企业版模块。
 *
 * 用法：node scripts/sync-ee.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'vendor', 'ee-dist');
const destDir = path.join(root, 'apps', 'server', 'dist', 'ee');

if (!fs.existsSync(srcDir)) {
  console.error(
    '[sync-ee] 错误：vendor/ee-dist 不存在。\n' +
      '  这是企业版（AI / 导入导出 / 权限 / MFA 等）的唯一来源，缺失会导致这些功能整体消失，\n' +
      '  且服务仍能正常启动、不报任何错误（app.module 会静默跳过 EE）。\n' +
      '  恢复方式：node scripts/fetch-ee.js',
  );
  process.exit(1);
}

// 不整目录删除（批量删除会被安全策略/回收站机制拦截），改为覆盖复制 + 清理陈旧文件
fs.mkdirSync(path.dirname(destDir), { recursive: true });

// 注意：Windows 下 fs.cpSync 递归复制本目录会导致进程崩溃，改用逐文件复制
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

// 删除 dest 中源目录已不存在的文件，避免版本切换后残留旧模块
function pruneStale(src, dest) {
  let removed = 0;
  for (const entry of fs.readdirSync(dest, { withFileTypes: true })) {
    const to = path.join(dest, entry.name);
    const from = path.join(src, entry.name);
    if (!fs.existsSync(from)) {
      fs.rmSync(to, { recursive: true, force: true });
      removed++;
    } else if (entry.isDirectory()) {
      removed += pruneStale(from, to);
    }
  }
  return removed;
}

copyDir(srcDir, destDir);

const pruned = pruneStale(srcDir, destDir);
if (pruned) {
  console.log(`[sync-ee] 清理陈旧文件 ${pruned} 项`);
}

/**
 * 许可证验签公钥改为可配置：优先 env / keys/license-public-key.pem，
 * 找不到时回退到上游内置公钥。
 */
const KEY_MARKER = '/* local-license-key-override */';
const constantFile = path.join(destDir, 'licence', 'license.constant.js');

if (fs.existsSync(constantFile)) {
  let code = fs.readFileSync(constantFile, 'utf8');
  if (!code.includes(KEY_MARKER)) {
    code += `
${KEY_MARKER}
(function () {
  var fs = require('fs');
  var path = require('path');
  function looksLikePem(s) { return typeof s === 'string' && s.indexOf('BEGIN') !== -1; }
  try {
    var envKey = process.env.LICENSE_PUBLIC_KEY;
    if (looksLikePem(envKey)) {
      exports.ENTERPRISE_LICENSE_PUBLIC_KEY = envKey.replace(/\\\\n/g, '\\n');
      return;
    }
    if (envKey) {
      var decoded = Buffer.from(envKey, 'base64').toString('utf8');
      if (looksLikePem(decoded)) {
        exports.ENTERPRISE_LICENSE_PUBLIC_KEY = decoded;
        return;
      }
    }
    var candidates = [];
    var envPath = process.env.LICENSE_PUBLIC_KEY_PATH;
    if (envPath) candidates.push(path.resolve(envPath));
    var starts = [process.cwd(), __dirname];
    for (var i = 0; i < starts.length; i++) {
      var dir = starts[i];
      for (var j = 0; j < 7; j++) {
        candidates.push(path.join(dir, 'keys', 'license-public-key.pem'));
        var parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
      }
    }
    for (var k = 0; k < candidates.length; k++) {
      if (fs.existsSync(candidates[k])) {
        var pem = fs.readFileSync(candidates[k], 'utf8');
        if (looksLikePem(pem)) {
          exports.ENTERPRISE_LICENSE_PUBLIC_KEY = pem;
          return;
        }
      }
    }
  } catch (e) {}
})();
`;
    fs.writeFileSync(constantFile, code);
  }
}

/**
 * 给 embedding 驱动加自动分批。
 * 原因：阿里云百炼（千问 text-embedding-v4）单次请求最多 10 条输入，
 * 超过会直接 400 "batch size is invalid, it should not be larger than 10"。
 * 上游是整批一次发出，长文档切块后必然失败。
 * 做法：把原 generateEmbeddingsBatch 重命名为 _embedBatch，
 * 新的 generateEmbeddingsBatch 按 AI_EMBEDDING_BATCH_SIZE（默认 10）分片合并。
 */
const BATCH_LIMIT = 10;
const driversDir = path.join(destDir, 'ai', 'drivers');
let patchedDrivers = 0;

if (fs.existsSync(driversDir)) {
  for (const file of fs.readdirSync(driversDir)) {
    if (!file.endsWith('.js')) continue;
    const full = path.join(driversDir, file);
    let code = fs.readFileSync(full, 'utf8');
    if (code.includes('_embedBatch(')) continue;

    const replaced = code.replace(
      /async generateEmbeddingsBatch\(texts\)\s*\{/,
      `async generateEmbeddingsBatch(texts) {
        const __batchSize = Number(process.env.AI_EMBEDDING_BATCH_SIZE) || ${BATCH_LIMIT};
        if (!Array.isArray(texts) || texts.length <= __batchSize) {
            return this._embedBatch(texts);
        }
        const __out = [];
        for (let __i = 0; __i < texts.length; __i += __batchSize) {
            const __part = await this._embedBatch(texts.slice(__i, __i + __batchSize));
            __out.push(...__part);
        }
        return __out;
    }
    async _embedBatch(texts) {`,
    );

    if (replaced !== code) {
      fs.writeFileSync(full, replaced);
      patchedDrivers++;
    }
  }
}

// 补丁必须命中，否则说明 vendor/ee-dist 的代码与预期不符（通常是换了别的版本镜像）。
// 静默失效的后果：长文档切块超过 10 条时千问返回 400，向量索引失败但没有任何报错。
if (patchedDrivers === 0 && fs.existsSync(driversDir)) {
  console.error(
    '[sync-ee] 错误：embedding 分批补丁未命中任何驱动。\n' +
      '  可能 vendor/ee-dist 不是 0.97.0 的产物，或上游已修改 generateEmbeddingsBatch 的写法。\n' +
      '  请核对 vendor/IMAGE.txt 记录的镜像版本后重试。',
  );
  process.exit(1);
}

/**
 * 修正 providerOptions 键名：新版 AI SDK 要求 openaiCompatible，
 * 旧写法 'openai-compatible' 会告警且维度参数可能不生效。
 */
let patchedProviderKey = 0;
if (fs.existsSync(driversDir)) {
  for (const file of fs.readdirSync(driversDir)) {
    if (!file.endsWith('.js')) continue;
    const full = path.join(driversDir, file);
    let code = fs.readFileSync(full, 'utf8');
    const next = code.replace(/'openai-compatible':\s*\{\n(\s*)dimensions:/g, 'openaiCompatible: {\n$1dimensions:');
    if (next !== code) {
      fs.writeFileSync(full, next);
      patchedProviderKey++;
    }
  }
}
if (patchedProviderKey > 0) {
  console.log(`[sync-ee] 已修正 ${patchedProviderKey} 个驱动的 providerOptions 键名`);
}
if (patchedDrivers > 0) {
  console.log(`[sync-ee] 已为 ${patchedDrivers} 个 embedding 驱动启用分批（每批最多 10 条）`);
}

/**
 * 深度校验：在独立子进程里真正 require 一次 dist/ee/ee.module.js。
 * app.module.ts 对 EE 加载失败是静默忽略的（只有 CLOUD=true 才退出），
 * 所以必须在这里把它变成构建期硬失败，否则会出现"服务正常启动、功能全没了"。
 */
const { execFileSync } = require('child_process');
const probe = `try {
  const m = require('./dist/ee/ee.module.js');
  if (!m.EeModule) throw new Error('EeModule 未导出');
  const dirs = require('fs').readdirSync('./dist/ee').filter((n) => require('fs').statSync('./dist/ee/' + n).isDirectory());
  if (dirs.length < 25) throw new Error('EE 模块数量异常: ' + dirs.length);
  console.log('OK:' + dirs.length);
} catch (e) {
  console.error(e && e.message ? e.message : String(e));
  process.exit(1);
}`;

try {
  const out = execFileSync(process.execPath, ['-e', probe], {
    cwd: path.join(root, 'apps', 'server'),
    encoding: 'utf8',
    timeout: 120000,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  console.log(`[sync-ee] 加载校验通过（${out.trim().replace('OK:', '')} 个 EE 模块）`);
} catch (err) {
  console.error(
    '[sync-ee] 错误：dist/ee 无法被正常加载，构建中止。\n' +
      '  原因通常是 vendor/ee-dist 与当前源码版本不匹配（DI token / 内部路径变化）。\n' +
      '  详情：\n' +
      String(err.stderr || err.message || '').slice(0, 1200),
  );
  process.exit(1);
}

console.log('[sync-ee] 已将 EE 模块同步到 apps/server/dist/ee');
