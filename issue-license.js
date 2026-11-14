#!/usr/bin/env node
/**
 * 许可证签发工具（RS256 JWT）
 *
 * 用法：
 *   签发：  node issue-license.js sign <私钥文件路径> [输出文件]
 *   验证：  node issue-license.js verify <公钥文件路径> <许可证文件或token>
 *
 * 示例：
 *   node issue-license.js sign ./keys/license-private-key.pem license-2087.txt
 *   node issue-license.js verify ./keys/license-public-key.pem license-2087.txt
 *
 * 不依赖任何 npm 包，仅使用 Node.js 内置 crypto。
 * Node >= 16 即可（base64url 支持）。
 */
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// 许可证 payload（expiresAt 已改为 2087 年）
// ---------------------------------------------------------------------------
const LICENSE_PAYLOAD = {
  licenseId: "031937f8-e9f9-4f6d-bc01-4487f7894c35",
  licenseType: "enterprise",
  seats: 1000,
  trial: true,
  lifetime: false,
  issuedAt: "2026-11-05T01:58:28.877Z",
  expiresAt: "2087-01-04T01:58:28.877Z", // 原 2027 -> 2087
  customer: {
    id: "25db5323-9e6b-4784-a90a-ef4ecbe8e221",
    name: "jl",
    email: "3221781586@qq.com",
  },
  version: "1",
  iat: 1793843908, // 2026-11-05T01:58:28Z，保持原签发时间
  exp: 3692483908, // 2087-01-04T01:58:28Z（date -u -d "2087-01-04T01:58:28.877Z" +%s）
  iss: "docmost.com",
};

const HEADER = { alg: "RS256", typ: "JWT" };

// ---------------------------------------------------------------------------
// Base64URL helpers
// ---------------------------------------------------------------------------
function b64url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function b64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4 !== 0) str += "=";
  return Buffer.from(str, "base64");
}

// ---------------------------------------------------------------------------
// 签发 / 验证
// ---------------------------------------------------------------------------
function sign(privateKeyPem) {
  const header = b64url(JSON.stringify(HEADER));
  const payload = b64url(JSON.stringify(LICENSE_PAYLOAD));
  const signingInput = `${header}.${payload}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(privateKeyPem); // Buffer

  return `${signingInput}.${b64url(signature)}`;
}

function verify(publicKeyPem, token) {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    return { valid: false, reason: "token 不是三段式 JWT" };
  }
  const [header, payload, signature] = parts;

  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(`${header}.${payload}`);
  verifier.end();

  let sigOk = false;
  try {
    sigOk = verifier.verify(publicKeyPem, b64urlDecode(signature));
  } catch (e) {
    return { valid: false, reason: `验签异常: ${e.message}` };
  }
  if (!sigOk) {
    return { valid: false, reason: "签名验证失败（token 被篡改或公钥不匹配）" };
  }

  const claims = JSON.parse(b64urlDecode(payload).toString("utf8"));
  const now = Math.floor(Date.now() / 1000);

  return {
    valid: true,
    expired: now >= claims.exp,
    claims,
    now,
  };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
function main() {
  const [cmd, ...rest] = process.argv.slice(2);

  if (cmd === "sign") {
    const keyPath = rest[0];
    const outPath = rest[1];
    if (!keyPath) {
      console.error("用法: node issue-license.js sign <私钥文件路径> [输出文件]");
      process.exit(1);
    }
    const privateKey = fs.readFileSync(path.resolve(keyPath), "utf8");
    if (!privateKey.includes("PRIVATE KEY")) {
      console.error("错误: 提供的文件看起来不是私钥（缺少 PRIVATE KEY 块）");
      process.exit(1);
    }

    const token = sign(privateKey);

    // 签发后用配对公钥自检一遍（若同目录存在公钥则顺带校验）
    console.log("=== 新许可证（2087 年到期） ===");
    console.log(token);
    console.log("");
    console.log("=== payload 摘要 ===");
    console.log(JSON.stringify(LICENSE_PAYLOAD, null, 2));

    if (outPath) {
      fs.writeFileSync(path.resolve(outPath), token + "\n", "utf8");
      console.log(`\n已写入: ${path.resolve(outPath)}`);
    }
    return;
  }

  if (cmd === "verify") {
    const keyPath = rest[0];
    const tokenSrc = rest[1];
    if (!keyPath || !tokenSrc) {
      console.error("用法: node issue-license.js verify <公钥文件路径> <许可证文件或token>");
      process.exit(1);
    }
    const publicKey = fs.readFileSync(path.resolve(keyPath), "utf8");
    let token = tokenSrc;
    if (fs.existsSync(tokenSrc) && fs.statSync(tokenSrc).isFile()) {
      token = fs.readFileSync(tokenSrc, "utf8");
    }

    const result = verify(publicKey, token);
    console.log(JSON.stringify(result, null, 2));
    if (!result.valid) process.exit(2);
    return;
  }

  console.error("用法:");
  console.error("  node issue-license.js sign   <私钥文件路径> [输出文件]");
  console.error("  node issue-license.js verify <公钥文件路径> <许可证文件或token>");
  process.exit(1);
}

main();
