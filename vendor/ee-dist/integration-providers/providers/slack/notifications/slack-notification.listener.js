"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SlackNotificationListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackNotificationListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const constants_1 = require("../../../../../integrations/queue/constants");
const event_contants_1 = require("../../../../../common/events/event.contants");
const slack_notify_prefs_service_1 = require("./slack-notify-prefs.service");
const notification_blocks_1 = require("../blocks/notification.blocks");
let SlackNotificationListener = SlackNotificationListener_1 = class SlackNotificationListener {
    constructor(notifyQueue, prefs) {
        this.notifyQueue = notifyQueue;
        this.prefs = prefs;
        this.logger = new common_1.Logger(SlackNotificationListener_1.name);
    }
    async onNotificationCreated(notification) {
        if (!notification_blocks_1.SLACK_NOTIFY_TYPES.has(notification.type))
            return;
        try {
            const link = await this.prefs.getEnabledLink(notification.workspaceId, notification.userId);
            if (!link)
                return;
            const payload = {
                notificationId: notification.id,
                workspaceId: notification.workspaceId,
                userId: notification.userId,
                type: notification.type,
                actorId: notification.actorId,
                pageId: notification.pageId,
                commentId: notification.commentId,
            };
            await this.notifyQueue.add(constants_1.QueueJob.SLACK_NOTIFICATION, payload, {
                jobId: notification.id,
                attempts: 3,
                backoff: { type: 'exponential', delay: 3000 },
                removeOnComplete: true,
                removeOnFail: true,
            });
        }
        catch (err) {
            this.logger.warn(`Failed to enqueue Slack notification: ${err.message}`);
        }
    }
};
exports.SlackNotificationListener = SlackNotificationListener;
__decorate([
    (0, event_emitter_1.OnEvent)(event_contants_1.EventName.NOTIFICATION_CREATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SlackNotificationListener.prototype, "onNotificationCreated", null);
exports.SlackNotificationListener = SlackNotificationListener = SlackNotificationListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)(constants_1.QueueName.SLACK_NOTIFY)),
    __metadata("design:paramtypes", [bullmq_2.Queue,
        slack_notify_prefs_service_1.SlackNotifyPrefsService])
], SlackNotificationListener);
//# sourceMappingURL=slack-notification.listener.js.map