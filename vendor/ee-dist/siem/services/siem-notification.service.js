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
var SiemNotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiemNotificationService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const notification_repo_1 = require("../../../database/repos/notification/notification.repo");
const domain_service_1 = require("../../../integrations/environment/domain.service");
const notification_service_1 = require("../../../core/notification/notification.service");
const notification_constants_1 = require("../../../core/notification/notification.constants");
const permission_1 = require("../../../common/helpers/types/permission");
const siem_destination_failing_email_1 = require("../../../integrations/transactional/emails/siem-destination-failing-email");
const siem_destination_disabled_email_1 = require("../../../integrations/transactional/emails/siem-destination-disabled-email");
const siem_destination_recovered_email_1 = require("../../../integrations/transactional/emails/siem-destination-recovered-email");
const siem_constants_1 = require("../siem.constants");
const TYPE_LABELS = {
    http: 'Generic HTTP',
    splunk_hec: 'Splunk HEC',
    datadog: 'Datadog',
};
function formatUtc(date) {
    const formatted = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
    }).format(date);
    return `${formatted} UTC`;
}
function selectRecipients(owners, creatorId) {
    const lastActive = (owner) => owner.lastActiveAt ? new Date(owner.lastActiveAt).getTime() : 0;
    const creator = owners.find((owner) => owner.id === creatorId);
    const others = owners
        .filter((owner) => owner.id !== creator?.id)
        .sort((a, b) => lastActive(b) - lastActive(a));
    return [...(creator ? [creator] : []), ...others]
        .slice(0, siem_constants_1.SIEM_MAX_NOTIFICATION_RECIPIENTS)
        .map((owner) => owner.id);
}
let SiemNotificationService = SiemNotificationService_1 = class SiemNotificationService {
    constructor(db, notifications, notificationRepo, domainService) {
        this.db = db;
        this.notifications = notifications;
        this.notificationRepo = notificationRepo;
        this.domainService = domainService;
        this.logger = new common_1.Logger(SiemNotificationService_1.name);
    }
    async destinationFailing(notice) {
        await this.notify(notice, notification_constants_1.NotificationType.SIEM_DESTINATION_FAILING, `SIEM destination "${notice.name}" is failing`, (settingsLink) => (0, siem_destination_failing_email_1.default)({
            destinationName: notice.name,
            destinationType: TYPE_LABELS[notice.type],
            lastError: notice.lastError,
            failingSince: formatUtc(notice.failingSince),
            settingsLink,
        }));
    }
    async destinationDisabled(notice) {
        await this.notify(notice, notification_constants_1.NotificationType.SIEM_DESTINATION_DISABLED, `SIEM destination "${notice.name}" was disabled after 24 hours of failures`, (settingsLink) => (0, siem_destination_disabled_email_1.default)({
            destinationName: notice.name,
            destinationType: TYPE_LABELS[notice.type],
            lastError: notice.lastError,
            failingSince: formatUtc(notice.failingSince),
            settingsLink,
        }));
    }
    async destinationRecovered(notice) {
        await this.notify(notice, notification_constants_1.NotificationType.SIEM_DESTINATION_RECOVERED, `SIEM destination "${notice.name}" recovered`, (settingsLink) => (0, siem_destination_recovered_email_1.default)({
            destinationName: notice.name,
            destinationType: TYPE_LABELS[notice.type],
            settingsLink,
        }));
    }
    async notify(notice, type, subject, template) {
        try {
            const owners = await this.db
                .selectFrom('users')
                .select(['id', 'lastActiveAt'])
                .where('workspaceId', '=', notice.workspaceId)
                .where('role', '=', permission_1.UserRole.OWNER)
                .where('deactivatedAt', 'is', null)
                .where('deletedAt', 'is', null)
                .execute();
            const recipients = selectRecipients(owners, notice.creatorId);
            if (recipients.length === 0)
                return;
            const failure = 'lastError' in notice ? notice : null;
            const data = {
                destinationId: notice.id,
                destinationName: notice.name,
                destinationType: notice.type,
                lastError: failure?.lastError.slice(0, siem_constants_1.SIEM_NOTIFICATION_ERROR_MAX_LENGTH) ??
                    null,
                failingSince: failure?.failingSince.toISOString() ?? null,
            };
            const settingsLink = `${this.domainService.getUrl(notice.hostname)}/settings/audit/siem`;
            for (const userId of recipients) {
                const notification = await this.notifications.create({
                    userId,
                    workspaceId: notice.workspaceId,
                    type,
                    data,
                });
                if (!notification)
                    continue;
                await this.notifications.queueEmail(userId, notification.id, subject, template(settingsLink));
                await this.notificationRepo.markAsEmailed(notification.id);
            }
        }
        catch (err) {
            this.logger.warn({ err, workspaceId: notice.workspaceId, destination: notice.name }, 'Failed to notify workspace owners about a SIEM destination');
        }
    }
};
exports.SiemNotificationService = SiemNotificationService;
exports.SiemNotificationService = SiemNotificationService = SiemNotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [Object, notification_service_1.NotificationService,
        notification_repo_1.NotificationRepo,
        domain_service_1.DomainService])
], SiemNotificationService);
//# sourceMappingURL=siem-notification.service.js.map