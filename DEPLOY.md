# 部署指南（另一台服务器从零搭建）

本仓库是 Docmost 0.97.0 的本地化改造版，与原版的最大区别：**企业版（EE）功能以编译产物形式内置在 `vendor/ee-dist`**，
不再依赖拉不到的私有 git 子模块。因此只要本仓库代码完整，任何一台装有 Docker 的机器都能一次构建成功。

---

## 一、前置条件

- Linux / Windows Server 均可，建议 2 核 4G 内存、20G 磁盘以上
- Docker 24+ 与 Docker Compose v2（`docker compose version` 能看到版本号）
- 能访问 GitHub（私有仓库需要 Personal Access Token 或 SSH key）、Docker Hub、npm registry

不需要在服务器上装 Node.js、pnpm、PostgreSQL、Redis —— 全部在容器里。

---

## 二、拉取代码

```bash
git clone https://github.com/<你的账号>/<仓库名>.git docmost
cd docmost
```

私有仓库用 HTTPS 时需要 PAT：

```bash
git clone https://<用户名>:<PAT>@github.com/<你的账号>/<仓库名>.git docmost
```

确认关键目录都在（缺任何一个都会出问题）：

```bash
ls vendor/ee-dist | wc -l        # 应大于 20
ls keys/                         # license-private-key.pem / license-public-key.pem
cat vendor/IMAGE.txt             # 记录 EE 产物来自哪个镜像 digest
```

---

## 三、改两处配置

编辑 `.env.server`（已随仓库提交，含全部密钥）：

| 变量 | 说明 |
|---|---|
| `APP_URL` | 改成实际访问地址，如 `http://192.168.1.10:3000` 或 `https://doc.你的域名.com`。填错会导致登录后跳转异常 |
| `APP_SECRET` | 换服务器建议重新生成：`openssl rand -hex 32`。改它等于让所有已登录会话失效 |

其余不要动，尤其 `DATABASE_URL` 里的主机名是 `db`、`REDIS_URL` 是 `redis`、`GOTENBERG_URL` 是 `gotenberg`，
这些是 compose 内部服务名，改成 `localhost` 就连不上了。

---

## 四、构建并启动

```bash
docker compose -f docker-compose.deploy.yml up -d --build
```

首次构建约 5–10 分钟（装依赖 + 编译前后端 + 同步 EE）。观察进度：

```bash
docker compose -f docker-compose.deploy.yml logs -f docmost
```

日志里必须出现这两行，否则说明 EE 没进镜像：

```
[sync-ee] 已为 N 个 embedding 驱动启用分批（每批最多 10 条）
[sync-ee] 加载校验通过（28 个 EE 模块）
```

### 验证

```bash
docker compose -f docker-compose.deploy.yml ps
curl -s http://127.0.0.1:3000/api/health
# {"status":"ok","info":{"database":{"status":"up"},"redis":{"status":"up"}},...}
```

浏览器打开 `APP_URL`，首次进入按提示注册管理员账号（第一个注册的就是管理员）。

---

## 五、激活企业版许可证

1. 用管理员登录，进入 **设置 → 许可证**
2. 把仓库根目录 `license-enterprise.txt` 的整行内容粘进去，点激活
3. 应显示 enterprise / 1000 seats / 到期 2087-01-04

许可证是 RS256 自签自验、**不联网校验**：签发私钥 `keys/license-private-key.pem`、验签公钥
`keys/license-public-key.pem` 都在这台机器上，镜像里只放了公钥（`/app/keys/`）。
许可证丢了或过期，用仓库根目录的 `issue-license.js` 重新签一张即可。

```bash
node issue-license.js --plan enterprise --seats 1000 --years 60
```

---

## 六、AI 向量检索

`.env.server` 里已配好阿里云百炼（千问）：

- 对话/补全：`qwen3.8-flash`
- 向量：`text-embedding-v4`，1024 维，pgvector 存储
- `AI_EMBEDDING_BATCH_SIZE=10`：千问单次最多 10 条，超过会 400，驱动已自动分批

换 key 只需改 `OPENAI_API_KEY` 后重启：`docker compose -f docker-compose.deploy.yml restart docmost`。

注意：**少于 200 字的页面不会被索引**（上游硬门槛），这类页面搜不到属正常。

---

## 七、把旧服务器的数据搬过来

数据库用 dump 恢复，不要直接拷 postgres 数据目录（版本/架构不同容易坏）。

**旧机器导出**

```bash
docker exec docmost-db pg_dump -U postgres -d docmost -Fc -f /tmp/docmost.dump
docker cp docmost-db:/tmp/docmost.dump ./docmost.dump
```

**新机器导入**（先让容器起来，应用可以先停着）

```bash
docker compose -f docker-compose.deploy.yml stop docmost
docker cp docmost.dump docmost-db:/tmp/docmost.dump
docker exec docmost-db pg_restore -U postgres -d docmost --clean --if-exists /tmp/docmost.dump
docker compose -f docker-compose.deploy.yml start docmost
```

附件（图片、上传文件）在 volume `docmost_storage` 里，单独打包：

```bash
# 旧机器
docker run --rm -v docmost_docmost_storage:/data -v $PWD:/out alpine tar czf /out/storage.tgz -C /data .
# 新机器
docker run --rm -v <项目名>_docmost_storage:/data -v $PWD:/in alpine tar xzf /in/storage.tgz -C /data
```

volume 名称可用 `docker volume ls` 确认（一般是 `<目录名>_docmost_storage`）。

---

## 八、日常运维

```bash
docker compose -f docker-compose.deploy.yml ps          # 状态
docker compose -f docker-compose.deploy.yml logs -f docmost
docker compose -f docker-compose.deploy.yml restart docmost
docker compose -f docker-compose.deploy.yml down        # 停（保留数据卷）
docker compose -f docker-compose.deploy.yml up -d --build   # 更新代码后重建
```

**备份**只需要两样：`db_data` 卷（数据库）和 `docmost_storage` 卷（附件）。

---

## 九、常见问题

**1. 页面能开，但 AI / 导入导出 / 许可证入口全是 404**
EE 没进镜像。检查构建日志有没有 `[sync-ee] 加载校验通过`；确认仓库里 `vendor/ee-dist` 存在且文件数 >20。
`vendor/` 缺失时构建会**直接失败**（脚本 exit 1），不会静默降级。

**2. 许可证激活提示签名无效**
镜像里的公钥和许可证不配对。确认 `keys/license-public-key.pem` 与签发用的私钥是一对，
并确认 `LICENSE_PUBLIC_KEY_PATH=/app/keys/license-public-key.pem` 未被改动。

**3. 启动报 `EADDRINUSE` 或端口被占**
改 `docker-compose.deploy.yml` 里的 `"3000:3000"` 左侧端口，比如 `"8080:3000"`，
同时把 `APP_URL` 改成对应端口。

**4. 数据库起不来，日志提示数据目录权限/版本问题**
本项目用的是 `pgvector/pgvector:pg18`，卷必须挂在 `/var/lib/postgresql`（不是 `.../data`），
compose 文件里已经处理好，改动时不要动这一行。

**5. 中文正文搜索不到**
向量索引依赖 embedding 接口。检查 `OPENAI_API_KEY` 是否有效、容器能否出网访问 `dashscope.aliyuncs.com`，
以及页面字数是否 ≥200。

---

## 十、安全提醒

本仓库**包含**以下敏感内容，请务必保持仓库为 Private，并开启两步验证：

- `keys/license-private-key.pem`（能签发任意许可证）
- `.env.server` 里的 `APP_SECRET`、`OPENAI_API_KEY`
- `license-enterprise.txt`

一旦仓库误设为公开或密钥外泄，请立刻：重新生成 `APP_SECRET`、在阿里云控制台吊销并重建 API Key、
用 `issue-license.js` 重新签发许可证并替换 `keys/` 下的一对密钥。
