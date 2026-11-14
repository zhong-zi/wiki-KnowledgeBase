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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const slack_provider_1 = require("./slack.provider");
const integration_registry_1 = require("../../../../core/integration/registry/integration-registry");
const integration_module_1 = require("../../../../core/integration/integration.module");
const slack_controller_1 = require("./webhook/slack.controller");
const slack_event_dispatcher_1 = require("./webhook/slack-event.dispatcher");
const slack_command_dispatcher_1 = require("./webhook/slack-command.dispatcher");
const slack_interactivity_dispatcher_1 = require("./webhook/slack-interactivity.dispatcher");
const slack_handler_context_builder_1 = require("./handlers/slack-handler-context.builder");
const slack_identity_resolver_1 = require("./identity/slack-identity.resolver");
const slack_processor_1 = require("./slack.processor");
const constants_1 = require("../../../../integrations/queue/constants");
const workspace_module_1 = require("../../../../core/workspace/workspace.module");
const user_module_1 = require("../../../../core/user/user.module");
const environment_module_1 = require("../../../../integrations/environment/environment.module");
const link_shared_handler_1 = require("./handlers/events/link-shared.handler");
const help_command_1 = require("./handlers/commands/help.command");
const recent_command_1 = require("./handlers/commands/recent.command");
const favorites_command_1 = require("./handlers/commands/favorites.command");
const search_command_1 = require("./handlers/commands/search.command");
const ask_command_1 = require("./handlers/commands/ask.command");
const page_module_1 = require("../../../../core/page/page.module");
const page_access_module_1 = require("../../../../core/page/page-access/page-access.module");
const favorite_module_1 = require("../../../../core/favorite/favorite.module");
const search_module_1 = require("../../../../core/search/search.module");
const ai_module_1 = require("../../../ai/ai.module");
const slack_page_writer_service_1 = require("./content/slack-page-writer.service");
const modal_content_stash_service_1 = require("./content/modal-content-stash.service");
const slack_unfurl_service_1 = require("./unfurl/slack-unfurl.service");
const slack_ask_processor_1 = require("./slack-ask.processor");
const page_search_options_handler_1 = require("./handlers/interactivity/page-search-options.handler");
const page_picker_submit_handler_1 = require("./handlers/interactivity/page-picker-submit.handler");
const add_to_page_shortcut_1 = require("./handlers/interactivity/add-to-page.shortcut");
const space_options_handler_1 = require("./handlers/interactivity/space-options.handler");
const create_page_shortcut_1 = require("./handlers/interactivity/create-page.shortcut");
const new_page_submit_handler_1 = require("./handlers/interactivity/new-page-submit.handler");
const app_uninstalled_handler_1 = require("./handlers/events/app-uninstalled.handler");
const app_home_opened_handler_1 = require("./handlers/events/app-home-opened.handler");
const disconnect_button_handler_1 = require("./handlers/interactivity/disconnect-button.handler");
const home_create_doc_handler_1 = require("./handlers/interactivity/home-create-doc.handler");
const home_search_handler_1 = require("./handlers/interactivity/home-search.handler");
const home_search_submit_handler_1 = require("./handlers/interactivity/home-search-submit.handler");
const create_document_submit_handler_1 = require("./handlers/interactivity/create-document-submit.handler");
const notify_command_1 = require("./handlers/commands/notify.command");
const notify_turn_off_handler_1 = require("./handlers/interactivity/notify-turn-off.handler");
const notify_comment_reply_handler_1 = require("./handlers/interactivity/notify-comment-reply.handler");
const notify_comment_reply_submit_handler_1 = require("./handlers/interactivity/notify-comment-reply-submit.handler");
const comment_module_1 = require("../../../../core/comment/comment.module");
const slack_notify_prefs_service_1 = require("./notifications/slack-notify-prefs.service");
const slack_notification_listener_1 = require("./notifications/slack-notification.listener");
const slack_notify_processor_1 = require("./slack-notify.processor");
let SlackModule = class SlackModule {
    constructor(registry, slackProvider) {
        this.registry = registry;
        this.slackProvider = slackProvider;
    }
    onModuleInit() {
        this.registry.register(this.slackProvider);
    }
};
exports.SlackModule = SlackModule;
exports.SlackModule = SlackModule = __decorate([
    (0, common_1.Module)({
        imports: [
            integration_module_1.IntegrationModule,
            bullmq_1.BullModule.registerQueue({ name: constants_1.QueueName.SLACK_INBOUND }),
            bullmq_1.BullModule.registerQueue({ name: constants_1.QueueName.SLACK_ASK }),
            bullmq_1.BullModule.registerQueue({ name: constants_1.QueueName.SLACK_NOTIFY }),
            workspace_module_1.WorkspaceModule,
            user_module_1.UserModule,
            environment_module_1.EnvironmentModule,
            page_module_1.PageModule,
            page_access_module_1.PageAccessModule,
            favorite_module_1.FavoriteModule,
            search_module_1.SearchModule,
            ai_module_1.AiModule,
            comment_module_1.CommentModule,
        ],
        controllers: [slack_controller_1.SlackController],
        providers: [
            slack_provider_1.SlackProvider,
            slack_event_dispatcher_1.SlackEventDispatcher,
            slack_command_dispatcher_1.SlackCommandDispatcher,
            slack_interactivity_dispatcher_1.SlackInteractivityDispatcher,
            slack_handler_context_builder_1.SlackHandlerContextBuilder,
            slack_identity_resolver_1.SlackIdentityResolver,
            slack_processor_1.SlackProcessor,
            slack_ask_processor_1.SlackAskProcessor,
            slack_notify_processor_1.SlackNotifyProcessor,
            slack_page_writer_service_1.SlackPageWriter,
            modal_content_stash_service_1.ModalContentStash,
            slack_unfurl_service_1.SlackUnfurlService,
            link_shared_handler_1.LinkSharedHandler,
            app_uninstalled_handler_1.AppUninstalledHandler,
            app_home_opened_handler_1.AppHomeOpenedHandler,
            help_command_1.HelpCommand,
            recent_command_1.RecentCommand,
            favorites_command_1.FavoritesCommand,
            search_command_1.SearchCommand,
            ask_command_1.AskCommand,
            page_search_options_handler_1.PageSearchOptionsHandler,
            page_picker_submit_handler_1.PagePickerSubmitHandler,
            add_to_page_shortcut_1.AddToPageShortcut,
            space_options_handler_1.SpaceOptionsHandler,
            create_page_shortcut_1.CreatePageShortcut,
            new_page_submit_handler_1.NewPageSubmitHandler,
            disconnect_button_handler_1.DisconnectButtonHandler,
            home_create_doc_handler_1.HomeCreateDocHandler,
            home_search_handler_1.HomeSearchHandler,
            home_search_submit_handler_1.HomeSearchSubmitHandler,
            create_document_submit_handler_1.CreateDocumentSubmitHandler,
            slack_notify_prefs_service_1.SlackNotifyPrefsService,
            slack_notification_listener_1.SlackNotificationListener,
            notify_command_1.NotifyCommand,
            notify_turn_off_handler_1.NotifyTurnOffHandler,
            notify_comment_reply_handler_1.NotifyCommentReplyHandler,
            notify_comment_reply_submit_handler_1.NotifyCommentReplySubmitHandler,
            {
                provide: slack_event_dispatcher_1.SLACK_EVENT_HANDLERS,
                useFactory: (linkShared, appUninstalled, appHomeOpened) => [
                    linkShared,
                    appUninstalled,
                    appHomeOpened,
                ],
                inject: [link_shared_handler_1.LinkSharedHandler, app_uninstalled_handler_1.AppUninstalledHandler, app_home_opened_handler_1.AppHomeOpenedHandler],
            },
            {
                provide: slack_command_dispatcher_1.SLACK_COMMAND_HANDLERS,
                useFactory: (help, recent, favorites, search, ask, notify) => [
                    help,
                    recent,
                    favorites,
                    search,
                    ask,
                    notify,
                ],
                inject: [
                    help_command_1.HelpCommand,
                    recent_command_1.RecentCommand,
                    favorites_command_1.FavoritesCommand,
                    search_command_1.SearchCommand,
                    ask_command_1.AskCommand,
                    notify_command_1.NotifyCommand,
                ],
            },
            {
                provide: slack_interactivity_dispatcher_1.SLACK_INTERACTIVITY_HANDLERS,
                useFactory: (pageSearch, addToPage, addToPageShortcut, spaceOptions, createPage, newPageSubmit, disconnect, homeCreateDoc, homeSearch, homeSearchSubmit, createDocSubmit, notifyTurnOff, commentReply, commentReplySubmit) => [
                    pageSearch,
                    addToPage,
                    addToPageShortcut,
                    spaceOptions,
                    createPage,
                    newPageSubmit,
                    disconnect,
                    homeCreateDoc,
                    homeSearch,
                    homeSearchSubmit,
                    createDocSubmit,
                    notifyTurnOff,
                    commentReply,
                    commentReplySubmit,
                ],
                inject: [
                    page_search_options_handler_1.PageSearchOptionsHandler,
                    page_picker_submit_handler_1.PagePickerSubmitHandler,
                    add_to_page_shortcut_1.AddToPageShortcut,
                    space_options_handler_1.SpaceOptionsHandler,
                    create_page_shortcut_1.CreatePageShortcut,
                    new_page_submit_handler_1.NewPageSubmitHandler,
                    disconnect_button_handler_1.DisconnectButtonHandler,
                    home_create_doc_handler_1.HomeCreateDocHandler,
                    home_search_handler_1.HomeSearchHandler,
                    home_search_submit_handler_1.HomeSearchSubmitHandler,
                    create_document_submit_handler_1.CreateDocumentSubmitHandler,
                    notify_turn_off_handler_1.NotifyTurnOffHandler,
                    notify_comment_reply_handler_1.NotifyCommentReplyHandler,
                    notify_comment_reply_submit_handler_1.NotifyCommentReplySubmitHandler,
                ],
            },
        ],
        exports: [slack_provider_1.SlackProvider],
    }),
    __metadata("design:paramtypes", [integration_registry_1.IntegrationRegistry,
        slack_provider_1.SlackProvider])
], SlackModule);
//# sourceMappingURL=slack.module.js.map