import { SlackHandler, SlackHandlerContext } from '../slack-handler.interface';
import { SlackInteractivityPayload } from '../../webhook/slack-interactivity.dispatcher';
import { SlackIdentityResolver } from '../../identity/slack-identity.resolver';
import { ModalContentStash } from '../../content/modal-content-stash.service';
export declare class AddToPageShortcut implements SlackHandler<SlackInteractivityPayload> {
    private readonly identity;
    private readonly stash;
    readonly type = "message_action:add_to_page";
    private readonly logger;
    constructor(identity: SlackIdentityResolver, stash: ModalContentStash);
    handle(payload: SlackInteractivityPayload, ctx: SlackHandlerContext): Promise<void>;
    private resolveSenderName;
    private promptAccountLink;
}
