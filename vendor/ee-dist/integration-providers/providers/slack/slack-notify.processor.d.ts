import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PageRepo } from "../../../../database/repos/page/page.repo";
import { CommentRepo } from "../../../../database/repos/comment/comment.repo";
import { PagePermissionRepo } from "../../../../database/repos/page/page-permission.repo";
import { UserRepo } from "../../../../database/repos/user/user.repo";
import { SlackHandlerContextBuilder } from './handlers/slack-handler-context.builder';
import { SlackNotifyPrefsService } from './notifications/slack-notify-prefs.service';
import type { SlackNotificationJobPayload } from './notifications/slack-notification.listener';
export declare class SlackNotifyProcessor extends WorkerHost {
    private readonly contextBuilder;
    private readonly prefs;
    private readonly pageRepo;
    private readonly commentRepo;
    private readonly pagePermissionRepo;
    private readonly userRepo;
    private readonly logger;
    constructor(contextBuilder: SlackHandlerContextBuilder, prefs: SlackNotifyPrefsService, pageRepo: PageRepo, commentRepo: CommentRepo, pagePermissionRepo: PagePermissionRepo, userRepo: UserRepo);
    process(job: Job<SlackNotificationJobPayload>): Promise<void>;
    onFailed(job: Job<SlackNotificationJobPayload>): void;
}
