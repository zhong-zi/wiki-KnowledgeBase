import { Queue } from 'bullmq';
import { Notification } from "../../../../../database/types/entity.types";
import { SlackNotifyPrefsService } from './slack-notify-prefs.service';
export type SlackNotificationJobPayload = {
    notificationId: string;
    workspaceId: string;
    userId: string;
    type: string;
    actorId: string | null;
    pageId: string | null;
    commentId: string | null;
};
export declare class SlackNotificationListener {
    private readonly notifyQueue;
    private readonly prefs;
    private readonly logger;
    constructor(notifyQueue: Queue, prefs: SlackNotifyPrefsService);
    onNotificationCreated(notification: Notification): Promise<void>;
}
