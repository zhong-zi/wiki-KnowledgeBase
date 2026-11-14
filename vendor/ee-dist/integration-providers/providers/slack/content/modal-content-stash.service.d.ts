import { RedisService } from '@nestjs-labs/nestjs-ioredis';
export type ModalContentOwner = {
    integrationId: string;
    slackUserId: string;
};
export declare const MODAL_CONTENT_TTL_SECONDS = 300;
export declare class ModalContentStash {
    private readonly redisService;
    private readonly redis;
    constructor(redisService: RedisService);
    put(owner: ModalContentOwner, content: string): Promise<string>;
    take(key: string, owner: ModalContentOwner): Promise<string | null>;
}
