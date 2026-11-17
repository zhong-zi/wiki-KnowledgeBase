import { Injectable } from '@nestjs/common';

@Injectable()
export class VersionService {
  constructor() {}

  async getVersion() {
    // 版本号固定为产品版本，不再向上游查询最新版本（无外部网络请求、无跳转）
    return {
      currentVersion: process.env.APP_VERSION || '1.0.0',
      latestVersion: 0,
      releaseUrl: '',
    };
  }
}
